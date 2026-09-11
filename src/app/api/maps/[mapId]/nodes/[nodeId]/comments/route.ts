import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, comments } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
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

    const rows = await db
      .select({
        id: comments.id,
        nodeId: comments.nodeId,
        content: comments.content,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        authorId: comments.authorId,
        authorName: users.displayName,
        authorEmail: users.email,
        authorAvatar: users.avatarUrl,
      })
      .from(comments)
      .leftJoin(users, eq(comments.authorId, users.id))
      .where(and(eq(comments.nodeId, nodeId), eq(comments.mapId, mapId)))
      .orderBy(desc(comments.createdAt));

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error obteniendo comentarios:", error);
    return handleApiError(error);
  }
}

export async function POST(
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

    const body = await request.json();
    const content = typeof body.content === "string" ? body.content.trim() : "";

    if (!content) {
      return NextResponse.json({ error: "El comentario no puede estar vacío" }, { status: 400 });
    }
    if (content.length > 2000) {
      return NextResponse.json({ error: "El comentario es demasiado largo" }, { status: 400 });
    }

    const [comment] = await db
      .insert(comments)
      .values({ mapId, nodeId, authorId: user.id, content })
      .returning();

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creando comentario:", error);
    return handleApiError(error);
  }
}

export async function DELETE(
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

    const body = await request.json();
    const { commentId } = body;
    if (!commentId) {
      return NextResponse.json({ error: "commentId es requerido" }, { status: 400 });
    }

    const [comment] = await db
      .select()
      .from(comments)
      .where(and(eq(comments.id, commentId), eq(comments.nodeId, nodeId)));

    if (!comment) {
      return NextResponse.json({ error: "Comentario no encontrado" }, { status: 404 });
    }

    // Solo el autor (o roles con capacidad de edición) puede eliminar.
    if (comment.authorId !== user.id) {
      await requirePermission(mapId, user.id, "node.update");
    }

    await db.delete(comments).where(eq(comments.id, commentId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error eliminando comentario:", error);
    return handleApiError(error);
  }
}