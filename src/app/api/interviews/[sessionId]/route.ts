import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, interviewSessions, mindMaps, mapNodes, mapEdges } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  nodePlannerAgent,
  type InterviewBrief,
} from "@/lib/agents";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { sessionId } = await params;

    const [session] = await db
      .select()
      .from(interviewSessions)
      .where(eq(interviewSessions.id, sessionId));

    if (!session) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error("Error obteniendo sesión:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { sessionId } = await params;
    const body = await request.json();

    const [session] = await db
      .select()
      .from(interviewSessions)
      .where(eq(interviewSessions.id, sessionId));

    if (!session) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};

    if (body.status) updates.status = body.status;
    if (body.topic) updates.topic = body.topic;
    if (body.objective) updates.objective = body.objective;
    if (body.audience) updates.audience = body.audience;
    if (body.knowledgeLevel) updates.knowledgeLevel = body.knowledgeLevel;
    if (body.depthPreference) updates.depthPreference = body.depthPreference;
    if (body.preferredSources) updates.preferredSources = JSON.stringify(body.preferredSources);
    if (body.conversationJson) {
      updates.conversationJson = typeof body.conversationJson === "string"
        ? body.conversationJson
        : JSON.stringify(body.conversationJson);
    }
    if (body.intentSummary) updates.intentSummary = body.intentSummary;

    updates.updatedAt = new Date();

    const [updated] = await db
      .update(interviewSessions)
      .set(updates)
      .where(eq(interviewSessions.id, sessionId))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error actualizando sesión:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { sessionId } = await params;

    const [session] = await db
      .select()
      .from(interviewSessions)
      .where(eq(interviewSessions.id, sessionId));

    if (!session) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
    }

    if (!session.topic || !session.objective) {
      return NextResponse.json(
        { error: "La sesión no tiene suficiente información para materializarse" },
        { status: 400 }
      );
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, userId));

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const brief: InterviewBrief = {
      topic: session.topic,
      userGoal: session.objective || "estudiar",
      targetAudience: session.audience || "estudiantes universitarios",
      currentKnowledgeLevel: (session.knowledgeLevel as InterviewBrief["currentKnowledgeLevel"]) || "intermediate",
      desiredDepth: (session.depthPreference as InterviewBrief["desiredDepth"]) || "medium",
      desiredOutcome: "study",
      scopeBoundaries: [],
      preferredPerspective: undefined,
      preferredSources: [],
      practicalFocus: [],
      exclusions: [],
      intentSummary: session.intentSummary || session.topic,
    };

    const nodePlan = await nodePlannerAgent({ brief });

    const [newMap] = await db
      .insert(mindMaps)
      .values({
        ownerId: user.id,
        title: `Mapa de ${session.topic}`,
        rootTopic: session.topic,
        purpose: session.objective,
        audience: session.audience,
        knowledgeLevel: session.knowledgeLevel,
        depthPreference: session.depthPreference,
        status: "draft",
      })
      .returning();

    const [rootNode] = await db
      .insert(mapNodes)
      .values({
        mapId: newMap.id as string,
        nodeType: "root",
        title: session.topic,
        generationMode: "generated",
        editorialStatus: "pending",
        createdBy: user.id as string,
        updatedBy: user.id as string,
        position: 0,
        hierarchyPath: "0",
        depth: 0,
        posX: "400",
        posY: "300",
      })
      .returning();

    const numberingToNodeId: Record<string, string> = {
      "0": rootNode.id,
    };

    const sortedNodes = [...nodePlan.nodes].sort((a, b) =>
      a.numbering.localeCompare(b.numbering, undefined, { numeric: true })
    );

    for (let i = 0; i < sortedNodes.length; i++) {
      const planned = sortedNodes[i];
      const parentNodeId = planned.parentNumbering
        ? numberingToNodeId[planned.parentNumbering]
        : rootNode.id;

      const depth = planned.depth;
      const levelOffset = (depth - 1) * 180;
      const xOffset = i * 200;

      const [node] = await db
        .insert(mapNodes)
        .values({
          mapId: newMap.id as string,
          parentNodeId: parentNodeId,
          nodeType: planned.nodeType,
          title: planned.displayTitle,
          generationMode: "generated",
          editorialStatus: "pending",
          createdBy: user.id as string,
          updatedBy: user.id as string,
          position: i,
          hierarchyPath: planned.numbering,
          depth: planned.depth,
          posX: String(400 + xOffset),
          posY: String(200 + levelOffset),
        })
        .returning();

      numberingToNodeId[planned.numbering] = node.id;

      await db
        .insert(mapEdges)
        .values({
          mapId: newMap.id as string,
          sourceNodeId: parentNodeId,
          targetNodeId: node.id,
          relationType: "structural",
          createdBy: user.id as string,
          updatedBy: user.id as string,
        })
        .returning();
    }

    const [updatedSession] = await db
      .update(interviewSessions)
      .set({
        status: "materialized",
        mapId: newMap.id,
        updatedAt: new Date(),
      })
      .where(eq(interviewSessions.id, sessionId))
      .returning();

    return NextResponse.json({
      session: updatedSession,
      map: newMap,
      nodePlan,
    });
  } catch (error) {
    console.error("Error materializando sesión:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
