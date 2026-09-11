import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { mapNodes, mindMaps, users, nodeRevisions, researchTasks, nodeSources, generationTasks } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { requirePermission } from "@/lib/permissions";
import { handleApiError } from "@/lib/errors";
import { getEnv } from "@/env";
import { isRateLimited } from "@/lib/rate-limit";
import { getModelForPurpose } from "@/lib/ai/models";
import { researcherAgent } from "@/lib/agents/researcher";
import { qaAgent } from "@/lib/agents/qa";
import { streamEditorContent } from "@/lib/agents/streamingEditor";
import type { ResearchContext } from "@/lib/agents/schemas";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ mapId: string; nodeId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    if (isRateLimited(`generate:${userId}`, 30, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Demasiadas generaciones, inténtalo más tarde" },
        { status: 429 }
      );
    }

    if (!getEnv().EXA_API_KEY) {
      return NextResponse.json(
        { error: "Servicio de investigación no disponible. Configure EXA_API_KEY" },
        { status: 500 }
      );
    }

    const { mapId, nodeId } = await params;

    const [map] = await db
      .select()
      .from(mindMaps)
      .where(and(eq(mindMaps.id, mapId), isNull(mindMaps.deletedAt)));

    if (!map) {
      return NextResponse.json({ error: "Mapa no encontrado" }, { status: 404 });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, userId));

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    await requirePermission(mapId, user.id, "generation.run");

    const [node] = await db
      .select()
      .from(mapNodes)
      .where(
        and(
          eq(mapNodes.id, nodeId),
          eq(mapNodes.mapId, mapId),
          isNull(mapNodes.deletedAt)
        )
      );

    if (!node) {
      return NextResponse.json({ error: "Nodo no encontrado" }, { status: 404 });
    }

    let parentNode = null;
    if (node.parentNodeId) {
      const [parent] = await db
        .select()
        .from(mapNodes)
        .where(eq(mapNodes.id, node.parentNodeId));
      parentNode = parent;
    }

    const body = await request.json().catch(() => ({}));
    const {
      targetAudience,
      difficultyLevel = "intermediate",
      learningObjective,
    } = body;

    const siblingNodes = node.parentNodeId
      ? await db
          .select()
          .from(mapNodes)
          .where(
            and(
              eq(mapNodes.mapId, mapId),
              eq(mapNodes.parentNodeId, node.parentNodeId),
              isNull(mapNodes.deletedAt)
            )
          )
      : [];

    const context: ResearchContext = {
      topic: node.title,
      nodeTitle: node.title,
      rootTopic: map.rootTopic || node.title,
      parentTopic: parentNode?.title,
      siblingTopics: siblingNodes
        .filter((s) => s.id !== nodeId)
        .map((s) => s.title),
      targetAudience: targetAudience || "estudiantes universitarios",
      difficultyLevel: difficultyLevel || "intermediate",
      learningObjective,
      additionalContext: node.shortSummary || undefined,
    };

    const stream = new ReadableStream({
      async start(controller) {
        try {
          let currentContext = { ...context };
          let research = await researcherAgent(currentContext);

          const persistSources = async () => {
            const startedAt = new Date();
            const [researchTask] = await db
              .insert(researchTasks)
              .values({
                mapId,
                nodeId,
                requestedBy: user.id,
                provider: "exa",
                status: "completed",
                queryText: research.query,
                promptContext: JSON.stringify(currentContext),
                rawResultJson: JSON.stringify(research.sources),
                normalizedResultJson: JSON.stringify(research.sources),
                startedAt,
                completedAt: new Date(),
              })
              .returning();

            await db
              .delete(nodeSources)
              .where(and(eq(nodeSources.mapId, mapId), eq(nodeSources.nodeId, nodeId)));

            for (const source of research.sources) {
              await db.insert(nodeSources).values({
                mapId,
                nodeId,
                researchTaskId: researchTask.id,
                title: source.title,
                url: source.url,
                provider: "exa",
                snippet: source.snippet || null,
                relevanceScore:
                  source.relevanceScore != null ? String(source.relevanceScore) : null,
                metadataJson: JSON.stringify({ highlights: source.highlights ?? [] }),
              });
            }
          };

          const runQa = async () => {
            controller.enqueue(`data: ${JSON.stringify({ stage: "qa" })}\n\n`);
            try {
              return await qaAgent(research);
            } catch {
              return {
                isSufficient: true,
                qualityScore: 7,
                coverageScore: 7,
                sourceQualityScore: 7,
                clarityScore: 7,
                gaps: [],
                recommendations: [],
                additionalQueries: [],
                validationReport: "QA omitido",
              };
            }
          };

          await persistSources();
          let qa = await runQa();

          // Re-run research with additional queries when QA finds gaps.
          let iterations = 0;
          while (
            !qa.isSufficient &&
            iterations < 1 &&
            qa.additionalQueries &&
            qa.additionalQueries.length > 0
          ) {
            iterations++;
            controller.enqueue(`data: ${JSON.stringify({ stage: "research" })}\n\n`);
            const extra = qa.additionalQueries.join("; ");
            currentContext = {
              ...currentContext,
              additionalContext: [
                currentContext.additionalContext,
                `Preguntas adicionales del control de calidad: ${extra}`,
              ]
                .filter(Boolean)
                .join("\n"),
            };
            research = await researcherAgent(currentContext);
            await persistSources();
            qa = await runQa();
          }

          controller.enqueue(`data: ${JSON.stringify({ stage: "editor" })}\n\n`);

          const editorStream = streamEditorContent(research, qa);
          const generationStartedAt = Date.now();

          for await (const chunk of editorStream.fullStream) {
            if (chunk.type === "text-delta") {
              controller.enqueue(`data: ${JSON.stringify({ 
                type: "text-delta", 
                content: chunk.text 
              })}\n\n`);
            }
          }

          const fullContent = await editorStream.text;
          const title = node.title;
          const shortSummary = research.summary.overview.slice(0, 200);

          try {
            const usage = await editorStream.usage;
            const editorModel = getModelForPurpose("expansion");
            await db.insert(generationTasks).values({
              mapId,
              nodeId,
              requestedBy: user.id,
              taskType: "node_generation",
              provider: "openrouter",
              modelName: editorModel.id,
              status: "completed",
              promptText: `node: ${node.title} | map: ${mapId}`,
              promptContext: JSON.stringify(context),
              responseText: fullContent.slice(0, 2000),
              tokenUsageJson: JSON.stringify({
                inputTokens: usage?.inputTokens ?? null,
                outputTokens: usage?.outputTokens ?? null,
                totalTokens: usage?.totalTokens ?? null,
              }),
              latencyMs: Date.now() - generationStartedAt,
              completedAt: new Date(),
            });
          } catch (usageError) {
            console.error("Error registrando uso de generación:", usageError);
          }

          await db.insert(nodeRevisions).values({
            nodeId: node.id,
            mapId,
            versionNumber: node.version + 1,
            title: node.title,
            shortSummary: node.shortSummary,
            contentMarkdown: node.contentMarkdown,
            generationMode: node.generationMode,
            editorialStatus: node.editorialStatus,
            createdBy: user.id,
          });

          await db
            .update(mapNodes)
            .set({
              title,
              shortSummary,
              contentMarkdown: fullContent,
              learningObjective: context.learningObjective || "Comprender los conceptos fundamentales",
              difficultyLevel: context.difficultyLevel,
              editorialStatus: "review",
              version: node.version + 2,
              lastGeneratedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(mapNodes.id, nodeId));

          controller.enqueue(`data: ${JSON.stringify({ 
            type: "done", 
            nodeId,
            title,
            shortSummary,
            contentMarkdown: fullContent,
            stage: "saved"
          })}\n\n`);

          controller.close();
        } catch (error) {
          console.error("[Streaming Generate] Error:", error);
          controller.enqueue(`data: ${JSON.stringify({ 
            type: "error", 
            error: error instanceof Error ? error.message : "Error desconocido" 
          })}\n\n`);
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error generando contenido:", error);
    return handleApiError(error);
  }
}
