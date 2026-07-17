import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { mapShareLinks, mindMaps, users, collaborationRequests, notifications } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

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
      return NextResponse.json({ error: "Link no encontrado" }, { status: 404 });
    }

    if (shareLink.expiresAt && new Date(shareLink.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Link expirado" }, { status: 410 });
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
      return NextResponse.json({ error: "Mapa no encontrado" }, { status: 404 });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, userId));

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    if (map.ownerId === user.id) {
      return NextResponse.json({ error: "Eres el propietario" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const { message } = body;

    const [existingRequest] = await db
      .select()
      .from(collaborationRequests)
      .where(
        and(
          eq(collaborationRequests.mapId, map.id),
          eq(collaborationRequests.requesterId, user.id)
        )
      );

    if (existingRequest) {
      if (existingRequest.status === "pending") {
        return NextResponse.json({ error: "Ya tienes una solicitud pendiente" }, { status: 400 });
      }
      if (existingRequest.status === "accepted") {
        return NextResponse.json({ error: "Ya eres colaborador" }, { status: 400 });
      }
    }

    const [newRequest] = await db
      .insert(collaborationRequests)
      .values({
        mapId: map.id,
        requesterId: user.id,
        message: message || null,
      })
      .returning();

    await db.insert(notifications).values({
      userId: map.ownerId,
      type: "collaboration_request",
      title: "Nueva solicitud de colaboración",
      message: `${user.displayName || user.email} quiere colaborar en "${map.title}"`,
      link: `/dashboard/${map.id}`,
      relatedId: newRequest.id,
    });

    return NextResponse.json({ success: true, request: newRequest });
  } catch (error) {
    console.error("Error requesting collaboration:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error interno" }, { status: 500 });
  }
}
