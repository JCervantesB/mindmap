import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, mindMaps, mapNodes, mapCollaborators } from "@/lib/db/schema";
import { eq, and, isNull, desc, sql, or } from "drizzle-orm";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, userId));

    if (!user) {
      return NextResponse.json([]);
    }

    const maps = await db
      .select({
        id: mindMaps.id,
        title: mindMaps.title,
        description: mindMaps.description,
        rootTopic: mindMaps.rootTopic,
        visibility: mindMaps.visibility,
        status: mindMaps.status,
        createdAt: mindMaps.createdAt,
        updatedAt: mindMaps.updatedAt,
        ownerId: mindMaps.ownerId,
      })
      .from(mindMaps)
      .where(
        and(
          isNull(mindMaps.deletedAt),
          or(
            eq(mindMaps.ownerId, user.id),
            sql`EXISTS (
              SELECT 1 FROM map_collaborators 
              WHERE map_collaborators.map_id = mind_maps.id 
              AND map_collaborators.user_id = ${user.id}
            )`
          )
        )
      )
      .orderBy(desc(mindMaps.updatedAt));

    const mapsWithCount = await Promise.all(
      maps.map(async (map) => {
        const [{ count }] = await db
          .select({ count: sql<number>`count(*)` })
          .from(mapNodes)
          .where(eq(mapNodes.mapId, map.id));

        const isCollaborator = map.ownerId !== user.id;

        return {
          id: map.id,
          title: map.title,
          description: map.description,
          rootTopic: map.rootTopic,
          visibility: map.visibility,
          status: map.status,
          createdAt: map.createdAt,
          updatedAt: map.updatedAt,
          nodeCount: Number(count),
          isCollaborator,
        };
      })
    );

    return NextResponse.json(mapsWithCount);
  } catch (error) {
    console.error("Error obteniendo mapas:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

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
    const { title, rootTopic, description, purpose, audience, knowledgeLevel, depthPreference } = body;

    if (!title || !rootTopic) {
      return NextResponse.json({ error: "El título y el tema raíz son requeridos" }, { status: 400 });
    }

    const [newMap] = await db
      .insert(mindMaps)
      .values({
        ownerId: user.id,
        title,
        rootTopic,
        description: description ?? null,
        purpose: purpose ?? null,
        audience: audience ?? null,
        knowledgeLevel: knowledgeLevel ?? null,
        depthPreference: depthPreference ?? null,
      })
      .returning();

    return NextResponse.json(newMap, { status: 201 });
  } catch (error) {
    console.error("Error creando mapa:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
