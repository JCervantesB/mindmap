import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, and, like, or } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    const searchResults = await db
      .select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
      })
      .from(users)
      .where(
        or(
          like(users.email, `%${query}%`),
          like(users.displayName, `%${query}%`)
        )
      )
      .limit(10);

    return NextResponse.json({ users: searchResults });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
