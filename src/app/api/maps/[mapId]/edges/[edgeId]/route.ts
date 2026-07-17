import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { mapEdges, mindMaps, users } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { requirePermission } from "@/lib/permissions";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ mapId: string; edgeId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { mapId, edgeId } = await params;

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

    await requirePermission(mapId, user.id, "edge.delete");

    const [edge] = await db
      .select()
      .from(mapEdges)
      .where(and(eq(mapEdges.id, edgeId), eq(mapEdges.mapId, mapId)));

    if (!edge) {
      return NextResponse.json({ error: "Arista no encontrada" }, { status: 404 });
    }

    await db.delete(mapEdges).where(eq(mapEdges.id, edgeId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error eliminando arista:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
