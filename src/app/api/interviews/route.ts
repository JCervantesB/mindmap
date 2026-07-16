import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, interviewSessions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
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
      return NextResponse.json([]);
    }

    const sessions = await db
      .select()
      .from(interviewSessions)
      .where(eq(interviewSessions.ownerId, user.id))
      .orderBy(desc(interviewSessions.updatedAt));

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error obteniendo entrevistas:", error);
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

    const [session] = await db
      .insert(interviewSessions)
      .values({
        ownerId: user.id,
        status: "draft",
      })
      .returning();

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error("Error creando entrevista:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
