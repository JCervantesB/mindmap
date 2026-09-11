import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { mapNodes, mindMaps, users, nodeSources } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { requirePermission } from "@/lib/permissions";
import { handleApiError } from "@/lib/errors";

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

    const sources = await db
      .select()
      .from(nodeSources)
      .where(and(eq(nodeSources.nodeId, nodeId), eq(nodeSources.mapId, mapId)))
      .orderBy(nodeSources.createdAt);

    return NextResponse.json(
      sources.map((s) => ({
        id: s.id,
        title: s.title,
        url: s.url,
        snippet: s.snippet,
        relevanceScore: s.relevanceScore ? Number(s.relevanceScore) : null,
        createdAt: s.createdAt,
      }))
    );
  } catch (error) {
    console.error("Error obteniendo fuentes:", error);
    return handleApiError(error);
  }
}