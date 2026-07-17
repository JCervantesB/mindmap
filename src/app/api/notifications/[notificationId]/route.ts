import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { notifications, collaborationRequests, mapCollaborators, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { notificationId } = await params;

    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, userId));

    if (!currentUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const [notification] = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, currentUser.id)
        )
      );

    if (!notification) {
      return NextResponse.json({ error: "Notificación no encontrada" }, { status: 404 });
    }

    await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(eq(notifications.id, notificationId));

    if (notification.type === "collaboration_request" && notification.relatedId) {
      const body = await request.json().catch(() => ({}));
      const { action } = body;

      const [collaborationRequest] = await db
        .select()
        .from(collaborationRequests)
        .where(eq(collaborationRequests.id, notification.relatedId));

      if (!collaborationRequest) {
        return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
      }

      if (action === "accept") {
        await db
          .update(collaborationRequests)
          .set({ status: "accepted", updatedAt: new Date() })
          .where(eq(collaborationRequests.id, collaborationRequest.id));

        await db.insert(mapCollaborators).values({
          mapId: collaborationRequest.mapId,
          userId: collaborationRequest.requesterId,
          role: "editor",
          invitedBy: currentUser.id,
          acceptedAt: new Date(),
        });

        await db.insert(notifications).values({
          userId: collaborationRequest.requesterId,
          type: "collaboration_accepted",
          title: "Solicitud aceptada",
          message: `Tu solicitud de colaboración fue aceptada`,
          link: `/dashboard/${collaborationRequest.mapId}`,
        });

        return NextResponse.json({ success: true, action: "accepted" });
      } else if (action === "reject") {
        await db
          .update(collaborationRequests)
          .set({ status: "rejected", updatedAt: new Date() })
          .where(eq(collaborationRequests.id, collaborationRequest.id));

        await db.insert(notifications).values({
          userId: collaborationRequest.requesterId,
          type: "collaboration_rejected",
          title: "Solicitud rechazada",
          message: `Tu solicitud de colaboración fue rechazada`,
          link: null,
        });

        return NextResponse.json({ success: true, action: "rejected" });
      }
    }

    return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
  } catch (error) {
    console.error("Error handling notification:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
