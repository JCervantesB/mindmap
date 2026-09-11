import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, mindMaps, mapNodes, mapEdges } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { handleApiError } from "@/lib/errors";
import { MAP_TEMPLATES } from "@/lib/templates";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, userId));

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const body = await request.json();
    const { templateId, title, rootTopic } = body;

    const template = MAP_TEMPLATES.find((t) => t.id === templateId);
    if (!template) {
      return NextResponse.json({ error: "Plantilla no encontrada" }, { status: 404 });
    }

    const finalTitle = title?.trim() || template.name;
    const finalTopic = rootTopic?.trim() || template.rootTopic;

    let createdMapId: string | null = null;

    try {
      const [newMap] = await db
        .insert(mindMaps)
        .values({
          ownerId: user.id,
          title: finalTitle,
          rootTopic: finalTopic,
          status: "draft",
        })
        .returning();

      createdMapId = newMap.id as string;

      const [rootNode] = await db
        .insert(mapNodes)
        .values({
          mapId: createdMapId,
          nodeType: "root",
          title: finalTopic,
          generationMode: "manual",
          editorialStatus: "draft",
          createdBy: user.id,
          updatedBy: user.id,
          position: 0,
          hierarchyPath: "0",
          depth: 0,
          posX: "400",
          posY: "300",
        })
        .returning();

      for (let i = 0; i < template.nodes.length; i++) {
        const planned = template.nodes[i];
        const [node] = await db
          .insert(mapNodes)
          .values({
            mapId: createdMapId,
            parentNodeId: rootNode.id,
            nodeType: planned.nodeType,
            title: planned.title,
            generationMode: "manual",
            editorialStatus: "draft",
            createdBy: user.id,
            updatedBy: user.id,
            position: i,
            hierarchyPath: planned.hierarchyPath,
            depth: planned.depth,
            posX: String(400 + i * 220),
            posY: String(200 + (planned.depth - 1) * 180),
          })
          .returning();

        await db.insert(mapEdges).values({
          mapId: createdMapId,
          sourceNodeId: rootNode.id,
          targetNodeId: node.id,
          relationType: "structural",
          createdBy: user.id,
          updatedBy: user.id,
        });
      }

      return NextResponse.json(
        { id: createdMapId, title: finalTitle },
        { status: 201 }
      );
    } catch (error) {
      if (createdMapId) {
        try {
          await db.delete(mapEdges).where(eq(mapEdges.mapId, createdMapId));
          await db.delete(mapNodes).where(eq(mapNodes.mapId, createdMapId));
          await db.delete(mindMaps).where(eq(mindMaps.id, createdMapId));
        } catch (cleanupError) {
          console.error("Error limpiando mapa de plantilla parcial:", cleanupError);
        }
      }
      throw error;
    }
  } catch (error) {
    console.error("Error creando mapa desde plantilla:", error);
    return handleApiError(error);
  }
}