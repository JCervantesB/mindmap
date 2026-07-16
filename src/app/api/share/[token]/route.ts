import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mapShareLinks, mindMaps, mapNodes, mapEdges, mapViews } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const [shareLink] = await db
      .select()
      .from(mapShareLinks)
      .where(
        and(
          eq(mapShareLinks.token, token),
          isNull(mapShareLinks.revokedAt)
        )
      );

    if (!shareLink) {
      return NextResponse.json(
        { error: "Link no encontrado o revocado" },
        { status: 404 }
      );
    }

    if (shareLink.expiresAt && new Date(shareLink.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "Este link ha expirado" },
        { status: 410 }
      );
    }

    const [map] = await db
      .select()
      .from(mindMaps)
      .where(
        and(
          eq(mindMaps.id, shareLink.mapId),
          isNull(mindMaps.deletedAt)
        )
      );

    if (!map) {
      return NextResponse.json(
        { error: "Mapa no encontrado" },
        { status: 404 }
      );
    }

    const nodes = await db
      .select()
      .from(mapNodes)
      .where(
        and(
          eq(mapNodes.mapId, shareLink.mapId),
          isNull(mapNodes.deletedAt)
        )
      );

    const edges = await db
      .select()
      .from(mapEdges)
      .where(eq(mapEdges.mapId, shareLink.mapId));

    const [defaultViewport] = await db
      .select()
      .from(mapViews)
      .where(eq(mapViews.mapId, shareLink.mapId))
      .limit(1);

    return NextResponse.json({
      id: map.id,
      title: map.title,
      rootTopic: map.rootTopic,
      nodes: nodes.map((node) => ({
        ...node,
        posX: Number(node.posX),
        posY: Number(node.posY),
      })),
      edges,
      viewport: defaultViewport
        ? {
            viewportX: Number(defaultViewport.viewportX),
            viewportY: Number(defaultViewport.viewportY),
            zoom: Number(defaultViewport.zoom),
          }
        : null,
    });
  } catch (error) {
    console.error("Error verificando share link:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
