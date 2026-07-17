import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { mapNodes, mindMaps, users } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { requirePermission } from "@/lib/permissions";
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

    if (!process.env.EXA_API_KEY) {
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

    const context: ResearchContext = {
      topic: node.title,
      nodeTitle: node.title,
      rootTopic: map.rootTopic || node.title,
      parentTopic: parentNode?.title,
      siblingTopics: [],
      targetAudience: targetAudience || "estudiantes universitarios",
      difficultyLevel: difficultyLevel || "intermediate",
      learningObjective,
      additionalContext: node.shortSummary || undefined,
    };

    const stream = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(`data: ${JSON.stringify({ stage: "research" })}\n\n`);

          const research = await researcherAgent(context);

          controller.enqueue(`data: ${JSON.stringify({ stage: "qa" })}\n\n`);

          let qa;
          try {
            qa = await qaAgent(research);
          } catch {
            qa = {
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

          controller.enqueue(`data: ${JSON.stringify({ stage: "editor" })}\n\n`);

          const editorStream = streamEditorContent(research, qa);

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

          await db
            .update(mapNodes)
            .set({
              title,
              shortSummary,
              contentMarkdown: fullContent,
              learningObjective: context.learningObjective || "Comprender los conceptos fundamentales",
              difficultyLevel: context.difficultyLevel,
              editorialStatus: "review",
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
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
