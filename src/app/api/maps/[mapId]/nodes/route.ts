import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { mapNodes, mapEdges, mindMaps, users } from "@/lib/db/schema";
import { eq, and, isNull, sql, asc } from "drizzle-orm";

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

    const nodes = await db
      .select()
      .from(mapNodes)
      .where(and(eq(mapNodes.mapId, mapId), isNull(mapNodes.deletedAt)))
      .orderBy(asc(mapNodes.position));

    return NextResponse.json({ nodes });
  } catch (error) {
    console.error("Error obteniendo nodos:", error);
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
    const {
      parentNodeId,
      title,
      nodeType = "concept",
      shortSummary,
      contentMarkdown,
      position,
    } = body;

    if (!title) {
      return NextResponse.json({ error: "Título es requerido" }, { status: 400 });
    }

    let finalPosition = position;
    if (finalPosition === undefined) {
      const siblings = await db
        .select({ position: mapNodes.position })
        .from(mapNodes)
        .where(
          and(
            eq(mapNodes.mapId, mapId),
            parentNodeId ? eq(mapNodes.parentNodeId, parentNodeId) : isNull(mapNodes.parentNodeId),
            isNull(mapNodes.deletedAt)
          )
        )
        .orderBy(asc(mapNodes.position));

      finalPosition = siblings.length > 0 ? Math.max(...siblings.map((s) => s.position)) + 1 : 0;
    }

    const [newNode] = await db
      .insert(mapNodes)
      .values({
        mapId,
        parentNodeId: parentNodeId || null,
        nodeType,
        title,
        shortSummary: shortSummary || null,
        contentMarkdown: contentMarkdown || null,
        generationMode: "manual",
        editorialStatus: "draft",
        createdBy: user.id,
        updatedBy: user.id,
        position: finalPosition,
        posX: body.posX || "0",
        posY: body.posY || "0",
      })
      .returning();

    if (parentNodeId) {
      await db
        .update(mapNodes)
        .set({
          childCount: sql`${mapNodes.childCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(mapNodes.id, parentNodeId));
    }

    return NextResponse.json(newNode, { status: 201 });
  } catch (error) {
    console.error("Error creando nodo:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
