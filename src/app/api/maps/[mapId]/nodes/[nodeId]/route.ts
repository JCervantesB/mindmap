import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import {
  mapNodes,
  mapEdges,
  mindMaps,
  users,
  nodeSources,
  nodeRevisions,
} from "@/lib/db/schema";
import { eq, and, isNull, sql } from "drizzle-orm";
import { requirePermission } from "@/lib/permissions";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ mapId: string; nodeId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { mapId, nodeId } = await params;

    const [map] = await db
      .select()
      .from(mindMaps)
      .where(and(eq(mindMaps.id, mapId), isNull(mindMaps.deletedAt)));

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

    await requirePermission(mapId, user.id, "node.update");

    const [node] = await db
      .select()
      .from(mapNodes)
      .where(and(eq(mapNodes.id, nodeId), eq(mapNodes.mapId, mapId), isNull(mapNodes.deletedAt)));

    if (!node) {
      return NextResponse.json({ error: "Nodo no encontrado" }, { status: 404 });
    }

    const body = await request.json();
    const {
      expectedVersion,
      title,
      nodeType,
      shortSummary,
      contentMarkdown,
      contentJson,
      learningObjective,
      difficultyLevel,
      editorialStatus,
      position,
      posX,
      posY,
      isCollapsed,
      width,
      height,
    } = body;

    const contentFields = { title, shortSummary, contentMarkdown, learningObjective, difficultyLevel, editorialStatus };
    const hasContentChanges = Object.values(contentFields).some(v => v !== undefined);

    if (expectedVersion !== undefined && node.version !== expectedVersion) {
      return NextResponse.json(
        {
          error: "Conflicto de versión",
          code: "VERSION_CONFLICT",
          currentVersion: node.version,
          expectedVersion,
          currentNode: node,
        },
        { status: 409 }
      );
    }

    if (hasContentChanges) {
      const lastRevision = await db
        .select({ versionNumber: nodeRevisions.versionNumber })
        .from(nodeRevisions)
        .where(eq(nodeRevisions.nodeId, nodeId))
        .orderBy(sql`${nodeRevisions.versionNumber} DESC`)
        .limit(1);

      const nextVersion = (lastRevision[0]?.versionNumber || node.version) + 1;

      await db.insert(nodeRevisions).values({
        nodeId: node.id,
        mapId: mapId,
        versionNumber: nextVersion,
        title: node.title,
        shortSummary: node.shortSummary,
        contentMarkdown: node.contentMarkdown,
        generationMode: node.generationMode,
        editorialStatus: node.editorialStatus,
        createdBy: user.id,
      });
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
      version: hasContentChanges ? node.version + 1 : node.version,
    };

    if (title !== undefined) updateData.title = title;
    if (nodeType !== undefined) updateData.nodeType = nodeType;
    if (shortSummary !== undefined) updateData.shortSummary = shortSummary;
    if (contentMarkdown !== undefined) updateData.contentMarkdown = contentMarkdown;
    if (contentJson !== undefined) updateData.contentJson = contentJson;
    if (learningObjective !== undefined) updateData.learningObjective = learningObjective;
    if (difficultyLevel !== undefined) updateData.difficultyLevel = difficultyLevel;
    if (editorialStatus !== undefined) updateData.editorialStatus = editorialStatus;
    if (position !== undefined) updateData.position = position;
    if (posX !== undefined) updateData.posX = String(posX);
    if (posY !== undefined) updateData.posY = String(posY);
    if (isCollapsed !== undefined) updateData.isCollapsed = isCollapsed;
    if (width !== undefined) updateData.width = width ? String(width) : null;
    if (height !== undefined) updateData.height = height ? String(height) : null;

    const [updatedNode] = await db
      .update(mapNodes)
      .set(updateData)
      .where(eq(mapNodes.id, nodeId))
      .returning();

    return NextResponse.json(updatedNode);
  } catch (error) {
    console.error("Error actualizando nodo:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
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

    const [map] = await db
      .select()
      .from(mindMaps)
      .where(and(eq(mindMaps.id, mapId), isNull(mindMaps.deletedAt)));

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

    await requirePermission(mapId, user.id, "node.delete");

    const [node] = await db
      .select()
      .from(mapNodes)
      .where(and(eq(mapNodes.id, nodeId), eq(mapNodes.mapId, mapId), isNull(mapNodes.deletedAt)));

    if (!node) {
      return NextResponse.json({ error: "Nodo no encontrado" }, { status: 404 });
    }

    async function deleteNodeRecursive(nodeIdToDelete: string) {
      const childNodes = await db
        .select({ id: mapNodes.id })
        .from(mapNodes)
        .where(
          and(
            eq(mapNodes.mapId, mapId),
            eq(mapNodes.parentNodeId, nodeIdToDelete),
            isNull(mapNodes.deletedAt)
          )
        );

      for (const child of childNodes) {
        await deleteNodeRecursive(child.id);
      }

      await db.delete(nodeSources).where(eq(nodeSources.nodeId, nodeIdToDelete));
      await db.delete(nodeRevisions).where(eq(nodeRevisions.nodeId, nodeIdToDelete));
      await db.delete(mapEdges).where(eq(mapEdges.sourceNodeId, nodeIdToDelete));
      await db.delete(mapEdges).where(eq(mapEdges.targetNodeId, nodeIdToDelete));

      await db
        .update(mapNodes)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(mapNodes.id, nodeIdToDelete));

      if (node.parentNodeId) {
        await db
          .update(mapNodes)
          .set({
            childCount: sql`${mapNodes.childCount} - 1`,
            updatedAt: new Date(),
          })
          .where(eq(mapNodes.id, node.parentNodeId));
      }
    }

    await deleteNodeRecursive(nodeId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error eliminando nodo:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
