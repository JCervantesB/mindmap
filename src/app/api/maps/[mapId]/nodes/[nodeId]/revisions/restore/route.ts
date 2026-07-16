import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { mapNodes, mindMaps, users, nodeRevisions } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ mapId: string; nodeId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
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

    if (!user || map.ownerId !== user.id) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const [node] = await db
      .select()
      .from(mapNodes)
      .where(and(eq(mapNodes.id, nodeId), eq(mapNodes.mapId, mapId), isNull(mapNodes.deletedAt)));

    if (!node) {
      return NextResponse.json({ error: "Nodo no encontrado" }, { status: 404 });
    }

    const body = await request.json();
    const { revisionId } = body;

    if (!revisionId) {
      return NextResponse.json({ error: "revisionId es requerido" }, { status: 400 });
    }

    const [revision] = await db
      .select()
      .from(nodeRevisions)
      .where(and(eq(nodeRevisions.id, revisionId), eq(nodeRevisions.nodeId, nodeId)));

    if (!revision) {
      return NextResponse.json({ error: "Revisión no encontrada" }, { status: 404 });
    }

    await db.insert(nodeRevisions).values({
      nodeId: node.id,
      mapId: mapId,
      versionNumber: node.version + 1,
      title: node.title,
      shortSummary: node.shortSummary,
      contentMarkdown: node.contentMarkdown,
      generationMode: node.generationMode,
      editorialStatus: node.editorialStatus,
      createdBy: user.id,
    });

    const [updatedNode] = await db
      .update(mapNodes)
      .set({
        title: revision.title,
        shortSummary: revision.shortSummary,
        contentMarkdown: revision.contentMarkdown,
        editorialStatus: revision.editorialStatus,
        version: node.version + 2,
        updatedAt: new Date(),
      })
      .where(eq(mapNodes.id, nodeId))
      .returning();

    return NextResponse.json(updatedNode);
  } catch (error) {
    console.error("Error restaurando revisión:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
