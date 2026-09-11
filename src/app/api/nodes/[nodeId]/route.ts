import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { mapNodes, mindMaps, users } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { requirePermission } from "@/lib/permissions";
import { handleApiError } from "@/lib/errors";

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
    const { posX, posY, width, height } = body;

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

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    await requirePermission(node.mapId, user.id, "node.update");

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (posX !== undefined) updates.posX = String(posX);
    if (posY !== undefined) updates.posY = String(posY);
    if (width !== undefined) updates.width = String(width);
    if (height !== undefined) updates.height = String(height);

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No se proporcionaron campos para actualizar" }, { status: 400 });
    }

    const [updatedNode] = await db
      .update(mapNodes)
      .set(updates)
      .where(eq(mapNodes.id, nodeId))
      .returning();

    return NextResponse.json(updatedNode);
  } catch (error) {
    console.error("Error actualizando nodo:", error);
    return handleApiError(error);
  }
}
