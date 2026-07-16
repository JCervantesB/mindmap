import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { mapShareLinks, mindMaps, users } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
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

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, userId));

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    await requirePermission(mapId, user.id, "map.read");

    const links = await db
      .select()
      .from(mapShareLinks)
      .where(and(eq(mapShareLinks.mapId, mapId), isNull(mapShareLinks.revokedAt)));

    return NextResponse.json(links);
  } catch (error) {
    console.error("Error listando links:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno" },
      { status: 500 }
    );
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

    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, userId));

    if (!currentUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    await requirePermission(mapId, currentUser.id, "map.share");

    const body = await request.json();
    const { expiresInDays } = body;

    const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");

    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    const [link] = await db
      .insert(mapShareLinks)
      .values({
        mapId,
        token,
        accessMode: "readonly",
        expiresAt,
        createdBy: currentUser.id,
      })
      .returning();

    return NextResponse.json({
      id: link.id,
      token: link.token,
      accessMode: link.accessMode,
      expiresAt: link.expiresAt,
      url: `/share/${link.token}`,
    });
  } catch (error) {
    console.error("Error creando link:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ mapId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { mapId } = await params;

    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, userId));

    if (!currentUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    await requirePermission(mapId, currentUser.id, "map.share");

    const body = await request.json();
    const { linkId, token } = body;

    if (!linkId && !token) {
      return NextResponse.json({ error: "ID o token requerido" }, { status: 400 });
    }

    let query = and(
      eq(mapShareLinks.mapId, mapId),
      linkId ? eq(mapShareLinks.id, linkId) : undefined,
      token ? eq(mapShareLinks.token, token) : undefined
    );

    await db
      .update(mapShareLinks)
      .set({ revokedAt: new Date() })
      .where(query!);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error revocando link:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno" },
      { status: 500 }
    );
  }
}
