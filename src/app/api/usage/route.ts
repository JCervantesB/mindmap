import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, generationTasks } from "@/lib/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { handleApiError } from "@/lib/errors";

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
      return NextResponse.json({
        totalGenerations: 0,
        totalTokens: 0,
        avgLatencyMs: 0,
        last30Days: 0,
      });
    }

    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totals] = await db
      .select({
        totalGenerations: sql<number>`count(*)`,
        avgLatencyMs: sql<number>`coalesce(avg(${generationTasks.latencyMs}), 0)`,
      })
      .from(generationTasks)
      .where(eq(generationTasks.requestedBy, user.id));

    const [recent] = await db
      .select({ count: sql<number>`count(*)` })
      .from(generationTasks)
      .where(
        and(
          eq(generationTasks.requestedBy, user.id),
          gte(generationTasks.createdAt, since)
        )
      );

    const rows = await db
      .select({ tokenUsageJson: generationTasks.tokenUsageJson })
      .from(generationTasks)
      .where(eq(generationTasks.requestedBy, user.id));

    const totalTokens = rows.reduce((acc, row) => {
      if (!row.tokenUsageJson) return acc;
      try {
        const parsed = JSON.parse(row.tokenUsageJson);
        return acc + (Number(parsed.totalTokens) || 0);
      } catch {
        return acc;
      }
    }, 0);

    return NextResponse.json({
      totalGenerations: Number(totals?.totalGenerations ?? 0),
      totalTokens,
      avgLatencyMs: Math.round(Number(totals?.avgLatencyMs ?? 0)),
      last30Days: Number(recent?.count ?? 0),
    });
  } catch (error) {
    console.error("Error obteniendo uso:", error);
    return handleApiError(error);
  }
}