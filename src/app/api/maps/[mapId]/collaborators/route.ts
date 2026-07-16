import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { mapCollaborators, mindMaps, users } from "@/lib/db/schema";
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

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, userId));

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    await requirePermission(mapId, user.id, "map.read");

    const [map] = await db
      .select()
      .from(mindMaps)
      .where(eq(mindMaps.id, mapId));

    const owner = map?.ownerId === user.id
      ? { id: user.id, email: "owner", displayName: "Propietario", role: "owner" }
      : null;

    const collaborators = await db
      .select({
        id: mapCollaborators.id,
        userId: mapCollaborators.userId,
        role: mapCollaborators.role,
        acceptedAt: mapCollaborators.acceptedAt,
        createdAt: mapCollaborators.createdAt,
        email: users.email,
        displayName: users.displayName,
      })
      .from(mapCollaborators)
      .leftJoin(users, eq(mapCollaborators.userId, users.id))
      .where(eq(mapCollaborators.mapId, mapId));

    return NextResponse.json({
      owner,
      collaborators: collaborators.map((c) => ({
        id: c.id,
        userId: c.userId,
        role: c.role,
        email: c.email,
        displayName: c.displayName,
        acceptedAt: c.acceptedAt,
        createdAt: c.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error listando colaboradores:", error);
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

    await requirePermission(mapId, currentUser.id, "map.manage_collaborators");

    const body = await request.json();
    const { email, role = "editor" } = body;

    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

    if (!["editor", "commenter", "viewer"].includes(role)) {
      return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
    }

    const [invitedUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!invitedUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const [map] = await db
      .select()
      .from(mindMaps)
      .where(eq(mindMaps.id, mapId));

    if (map?.ownerId === invitedUser.id) {
      return NextResponse.json({ error: "No puedes invitar al propietario" }, { status: 400 });
    }

    const [existing] = await db
      .select()
      .from(mapCollaborators)
      .where(
        and(
          eq(mapCollaborators.mapId, mapId),
          eq(mapCollaborators.userId, invitedUser.id)
        )
      );

    if (existing) {
      return NextResponse.json({ error: "Usuario ya es colaborador" }, { status: 400 });
    }

    const [collaborator] = await db
      .insert(mapCollaborators)
      .values({
        mapId,
        userId: invitedUser.id,
        role,
        invitedBy: currentUser.id,
        acceptedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      id: collaborator.id,
      userId: collaborator.userId,
      role: collaborator.role,
      email: invitedUser.email,
      displayName: invitedUser.displayName,
    });
  } catch (error) {
    console.error("Error agregando colaborador:", error);
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

    await requirePermission(mapId, currentUser.id, "map.manage_collaborators");

    const body = await request.json();
    const { collaboratorId, userId: targetUserId } = body;

    if (!collaboratorId && !targetUserId) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    let query = and(
      eq(mapCollaborators.mapId, mapId),
      collaboratorId ? eq(mapCollaborators.id, collaboratorId) : undefined,
      targetUserId ? eq(mapCollaborators.userId, targetUserId) : undefined
    );

    await db.delete(mapCollaborators).where(query!);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error eliminando colaborador:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno" },
      { status: 500 }
    );
  }
}
