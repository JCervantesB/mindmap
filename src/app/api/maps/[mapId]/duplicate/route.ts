import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import {
  users,
  mindMaps,
  mapNodes,
  mapEdges,
} from "@/lib/db/schema";
import { eq, and, isNull, asc } from "drizzle-orm";
import { requirePermission } from "@/lib/permissions";
import { handleApiError } from "@/lib/errors";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ mapId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { mapId } = await params;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, userId));

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    await requirePermission(mapId, user.id, "map.read");

    const [map] = await db
      .select()
      .from(mindMaps)
      .where(and(eq(mindMaps.id, mapId), isNull(mindMaps.deletedAt)));

    if (!map) {
      return NextResponse.json({ error: "Mapa no encontrado" }, { status: 404 });
    }

    let createdMapId: string | null = null;

    try {
      const [newMap] = await db
        .insert(mindMaps)
        .values({
          ownerId: user.id,
          title: `${map.title} (copia)`,
          description: map.description,
          rootTopic: map.rootTopic,
          purpose: map.purpose,
          audience: map.audience,
          knowledgeLevel: map.knowledgeLevel,
          depthPreference: map.depthPreference,
          visibility: "private",
          status: "draft",
          settingsJson: map.settingsJson,
        })
        .returning();

      createdMapId = newMap.id as string;

      const sourceNodes = await db
        .select()
        .from(mapNodes)
        .where(and(eq(mapNodes.mapId, mapId), isNull(mapNodes.deletedAt)))
        .orderBy(asc(mapNodes.depth));

      const idMapping = new Map<string, string>();

      for (const node of sourceNodes) {
        const [inserted] = await db
          .insert(mapNodes)
          .values({
            mapId: createdMapId,
            parentNodeId: node.parentNodeId
              ? (idMapping.get(node.parentNodeId) ?? null)
              : null,
            createdBy: user.id,
            updatedBy: user.id,
            nodeType: node.nodeType,
            title: node.title,
            slug: node.slug,
            shortSummary: node.shortSummary,
            contentMarkdown: node.contentMarkdown,
            contentJson: node.contentJson,
            learningObjective: node.learningObjective,
            difficultyLevel: node.difficultyLevel,
            generationMode: node.generationMode,
            editorialStatus: node.editorialStatus,
            sourceCount: node.sourceCount,
            childCount: node.childCount,
            position: node.position,
            hierarchyPath: node.hierarchyPath,
            depth: node.depth,
            posX: node.posX,
            posY: node.posY,
            width: node.width,
            height: node.height,
            isCollapsed: node.isCollapsed,
            version: 1,
            lastGeneratedAt: node.lastGeneratedAt,
          })
          .returning();

        idMapping.set(node.id, inserted.id);
      }

      const sourceEdges = await db
        .select()
        .from(mapEdges)
        .where(eq(mapEdges.mapId, mapId));

      for (const edge of sourceEdges) {
        const source = idMapping.get(edge.sourceNodeId);
        const target = idMapping.get(edge.targetNodeId);
        if (!source || !target) continue;
        await db.insert(mapEdges).values({
          mapId: createdMapId,
          sourceNodeId: source,
          targetNodeId: target,
          relationType: edge.relationType,
          label: edge.label,
          styleJson: edge.styleJson,
          createdBy: user.id,
          updatedBy: user.id,
          version: 1,
        });
      }

      return NextResponse.json(
        { id: createdMapId, title: `${map.title} (copia)` },
        { status: 201 }
      );
    } catch (error) {
      if (createdMapId) {
        try {
          await db.delete(mapEdges).where(eq(mapEdges.mapId, createdMapId));
          await db.delete(mapNodes).where(eq(mapNodes.mapId, createdMapId));
          await db.delete(mindMaps).where(eq(mindMaps.id, createdMapId));
        } catch (cleanupError) {
          console.error("Error limpiando duplicado parcial:", cleanupError);
        }
      }
      throw error;
    }
  } catch (error) {
    console.error("Error duplicando mapa:", error);
    return handleApiError(error);
  }
}