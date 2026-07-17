import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { mapViews, mindMaps, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
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

    const [view] = await db
      .select()
      .from(mapViews)
      .where(and(eq(mapViews.mapId, mapId), eq(mapViews.userId, user.id)));

    if (!view) {
      return NextResponse.json({
        viewportX: 0,
        viewportY: 0,
        zoom: 1,
        selectedNodeId: null,
        panelState: "open",
      });
    }

    return NextResponse.json({
      viewportX: Number(view.viewportX),
      viewportY: Number(view.viewportY),
      zoom: Number(view.zoom),
      selectedNodeId: view.selectedNodeId,
      panelState: view.panelState,
    });
  } catch (error) {
    console.error("Error obteniendo viewport:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PUT(
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

    await requirePermission(mapId, user.id, "map.update");

    const body = await request.json();
    const { viewportX, viewportY, zoom, selectedNodeId, panelState } = body;

    const [view] = await db
      .select()
      .from(mapViews)
      .where(and(eq(mapViews.mapId, mapId), eq(mapViews.userId, user.id)));

    if (view) {
      await db
        .update(mapViews)
        .set({
          viewportX: String(viewportX ?? 0),
          viewportY: String(viewportY ?? 0),
          zoom: String(zoom ?? 1),
          selectedNodeId: selectedNodeId ?? null,
          panelState: panelState ?? null,
          updatedAt: new Date(),
        })
        .where(eq(mapViews.id, view.id));
    } else {
      await db.insert(mapViews).values({
        mapId,
        userId: user.id,
        viewportX: String(viewportX ?? 0),
        viewportY: String(viewportY ?? 0),
        zoom: String(zoom ?? 1),
        selectedNodeId: selectedNodeId ?? null,
        panelState: panelState ?? null,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error guardando viewport:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
