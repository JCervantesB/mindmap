import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import {
  mindMaps,
  users,
  mapNodes,
  mapEdges,
  mapViews,
  mapCollaborators,
  mapShareLinks,
  interviewSessions,
  researchTasks,
  generationTasks,
  nodeSources,
  nodeRevisions,
  domainEvents,
} from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { requirePermission } from "@/lib/permissions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mapId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { mapId } = await params;

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

    await requirePermission(mapId, user.id, "map.read");

    const nodes = await db
      .select()
      .from(mapNodes)
      .where(and(eq(mapNodes.mapId, mapId), isNull(mapNodes.deletedAt)));

    const edges = await db
      .select()
      .from(mapEdges)
      .where(eq(mapEdges.mapId, mapId));

    return NextResponse.json({
      ...map,
      nodes: nodes.map((node) => ({
        ...node,
        posX: Number(node.posX),
        posY: Number(node.posY),
      })),
      edges,
    });
  } catch (error) {
    console.error("Error obteniendo mapa:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ mapId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { mapId } = await params;

    const [map] = await db
      .select()
      .from(mindMaps)
      .where(eq(mindMaps.id, mapId));

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

    await requirePermission(mapId, user.id, "map.delete");

    const nodes = await db
      .select({ id: mapNodes.id })
      .from(mapNodes)
      .where(eq(mapNodes.mapId, mapId));

    const nodeIds = nodes.map((n) => n.id);

    await db.delete(domainEvents).where(eq(domainEvents.mapId, mapId));

    for (const nodeId of nodeIds) {
      await db.delete(nodeSources).where(eq(nodeSources.nodeId, nodeId));
      await db.delete(nodeRevisions).where(eq(nodeRevisions.nodeId, nodeId));
    }

    await db.delete(researchTasks).where(eq(researchTasks.mapId, mapId));
    await db.delete(generationTasks).where(eq(generationTasks.mapId, mapId));
    await db.delete(mapViews).where(eq(mapViews.mapId, mapId));
    await db.delete(mapCollaborators).where(eq(mapCollaborators.mapId, mapId));
    await db.delete(mapShareLinks).where(eq(mapShareLinks.mapId, mapId));
    await db.delete(mapEdges).where(eq(mapEdges.mapId, mapId));
    await db.delete(mapNodes).where(eq(mapNodes.mapId, mapId));
    await db
      .update(interviewSessions)
      .set({ mapId: null })
      .where(and(eq(interviewSessions.mapId, mapId), eq(interviewSessions.status, "materialized")));

    await db
      .update(mindMaps)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(mindMaps.id, mapId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error eliminando mapa:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
