import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { mapNodes, mindMaps, users } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ nodeId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { nodeId } = await params;
    const body = await request.json();
    const { posX, posY } = body;

    if (posX === undefined || posY === undefined) {
      return NextResponse.json({ error: "posX y posY son requeridos" }, { status: 400 });
    }

    const [node] = await db
      .select()
      .from(mapNodes)
      .where(and(eq(mapNodes.id, nodeId), isNull(mapNodes.deletedAt)));

    if (!node) {
      return NextResponse.json({ error: "Nodo no encontrado" }, { status: 404 });
    }

    const [map] = await db
      .select()
      .from(mindMaps)
      .where(and(eq(mindMaps.id, node.mapId), isNull(mindMaps.deletedAt)));

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

    const [updatedNode] = await db
      .update(mapNodes)
      .set({
        posX: String(posX),
        posY: String(posY),
        updatedAt: new Date(),
      })
      .where(eq(mapNodes.id, nodeId))
      .returning();

    return NextResponse.json(updatedNode);
  } catch (error) {
    console.error("Error actualizando nodo:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
