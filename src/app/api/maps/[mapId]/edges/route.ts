import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { mapEdges, mindMaps, users } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";

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

    if (!user || map.ownerId !== user.id) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const edges = await db
      .select()
      .from(mapEdges)
      .where(eq(mapEdges.mapId, mapId));

    return NextResponse.json({ edges });
  } catch (error) {
    console.error("Error obteniendo aristas:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

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

    const body = await request.json();
    const { sourceNodeId, targetNodeId, relationType = "structural", label } = body;

    if (!sourceNodeId || !targetNodeId) {
      return NextResponse.json(
        { error: "sourceNodeId y targetNodeId son requeridos" },
        { status: 400 }
      );
    }

    const [newEdge] = await db
      .insert(mapEdges)
      .values({
        mapId,
        sourceNodeId,
        targetNodeId,
        relationType,
        label: label || null,
        createdBy: user.id,
        updatedBy: user.id,
      })
      .returning();

    return NextResponse.json(newEdge, { status: 201 });
  } catch (error) {
    console.error("Error creando arista:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
