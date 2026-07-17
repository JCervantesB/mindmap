import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { mapNodes, mindMaps, users, nodeRevisions } from "@/lib/db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import { requirePermission } from "@/lib/permissions";

export async function GET(
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

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    await requirePermission(mapId, user.id, "map.read");

    const [node] = await db
      .select()
      .from(mapNodes)
      .where(and(eq(mapNodes.id, nodeId), eq(mapNodes.mapId, mapId), isNull(mapNodes.deletedAt)));

    if (!node) {
      return NextResponse.json({ error: "Nodo no encontrado" }, { status: 404 });
    }

    const revisions = await db
      .select()
      .from(nodeRevisions)
      .where(eq(nodeRevisions.nodeId, nodeId))
      .orderBy(desc(nodeRevisions.versionNumber));

    return NextResponse.json(revisions);
  } catch (error) {
    console.error("Error listando revisiones:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
