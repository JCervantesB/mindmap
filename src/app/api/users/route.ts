import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(userId);

    const email = clerkUser.emailAddresses[0]?.emailAddress ?? null;
    const displayName =
      clerkUser.firstName && clerkUser.lastName
        ? `${clerkUser.firstName} ${clerkUser.lastName}`
        : clerkUser.firstName ?? clerkUser.username ?? null;
    const avatarUrl = clerkUser.imageUrl ?? null;

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, userId));

    if (existingUser) {
      const [updated] = await db
        .update(users)
        .set({
          email,
          displayName,
          avatarUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.clerkUserId, userId))
        .returning();

      return NextResponse.json(updated);
    }

    const [newUser] = await db
      .insert(users)
      .values({
        clerkUserId: userId,
        email,
        displayName,
        avatarUrl,
      })
      .returning();

    return NextResponse.json(newUser);
  } catch (error) {
    console.error("Error sincronizando usuario:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
