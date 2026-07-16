import { eq, and, isNull, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { mapNodes } from '@/lib/db/schema';
import type {
  NodeRepository,
  CreateNodeInput,
  UpdateNodeContentInput,
  UpdateNodePositionInput,
} from '@/shared/application/repositories';
import type { MapNode } from '@/shared/domain/types';

export class DrizzleNodeRepository implements NodeRepository {
  async create(input: CreateNodeInput): Promise<MapNode> {
    const [result] = await db.insert(mapNodes).values({
      mapId: input.mapId,
      parentNodeId: input.parentNodeId ?? null,
      createdBy: input.createdBy,
      updatedBy: input.updatedBy,
      nodeType: input.nodeType ?? 'concept',
      title: input.title,
      posX: String(input.posX ?? 0),
      posY: String(input.posY ?? 0),
    }).returning();

    return this.mapToNode(result);
  }

  async findById(id: string): Promise<MapNode | null> {
    const [result] = await db
      .select()
      .from(mapNodes)
      .where(and(eq(mapNodes.id, id), isNull(mapNodes.deletedAt)));

    return result ? this.mapToNode(result) : null;
  }

  async findByMapId(mapId: string): Promise<MapNode[]> {
    const results = await db
      .select()
      .from(mapNodes)
      .where(and(eq(mapNodes.mapId, mapId), isNull(mapNodes.deletedAt)));

    return results.map(this.mapToNode);
  }

  async findRootByMapId(mapId: string): Promise<MapNode | null> {
    const [result] = await db
      .select()
      .from(mapNodes)
      .where(
        and(
          eq(mapNodes.mapId, mapId),
          eq(mapNodes.nodeType, 'root'),
          isNull(mapNodes.deletedAt)
        )
      );

    return result ? this.mapToNode(result) : null;
  }

  async updateContent(input: UpdateNodeContentInput): Promise<MapNode> {
    const [result] = await db
      .update(mapNodes)
      .set({
        ...(input.title !== undefined && { title: input.title }),
        ...(input.shortSummary !== undefined && { shortSummary: input.shortSummary }),
        ...(input.contentMarkdown !== undefined && { contentMarkdown: input.contentMarkdown }),
        ...(input.learningObjective !== undefined && { learningObjective: input.learningObjective }),
        ...(input.difficultyLevel !== undefined && { difficultyLevel: input.difficultyLevel }),
        ...(input.editorialStatus !== undefined && { editorialStatus: input.editorialStatus }),
        updatedBy: input.updatedBy,
        version: sql`${mapNodes.version} + 1`,
        updatedAt: new Date(),
      })
      .where(and(eq(mapNodes.id, input.id), eq(mapNodes.version, input.expectedVersion)))
      .returning();

    return this.mapToNode(result);
  }

  async updatePosition(input: UpdateNodePositionInput): Promise<MapNode> {
    const [result] = await db
      .update(mapNodes)
      .set({
        posX: String(input.posX),
        posY: String(input.posY),
        ...(input.isCollapsed !== undefined && { isCollapsed: input.isCollapsed }),
        updatedBy: input.updatedBy,
        version: sql`${mapNodes.version} + 1`,
        updatedAt: new Date(),
      })
      .where(and(eq(mapNodes.id, input.id), eq(mapNodes.version, input.expectedVersion)))
      .returning();

    return this.mapToNode(result);
  }

  async incrementChildCount(id: string): Promise<void> {
    await db
      .update(mapNodes)
      .set({
        childCount: sql`${mapNodes.childCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(mapNodes.id, id));
  }

  async softDelete(id: string): Promise<void> {
    await db
      .update(mapNodes)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(mapNodes.id, id));
  }

  private mapToNode(row: typeof mapNodes.$inferSelect): MapNode {
    return {
      id: row.id,
      mapId: row.mapId,
      parentNodeId: row.parentNodeId,
      createdBy: row.createdBy,
      updatedBy: row.updatedBy,
      nodeType: row.nodeType as MapNode['nodeType'],
      title: row.title,
      slug: row.slug,
      shortSummary: row.shortSummary,
      contentMarkdown: row.contentMarkdown,
      contentJson: row.contentJson,
      learningObjective: row.learningObjective,
      difficultyLevel: row.difficultyLevel as MapNode['difficultyLevel'],
      generationMode: row.generationMode as MapNode['generationMode'],
      editorialStatus: row.editorialStatus as MapNode['editorialStatus'],
      sourceCount: row.sourceCount,
      childCount: row.childCount,
      position: row.position,
      posX: Number(row.posX),
      posY: Number(row.posY),
      width: row.width ? Number(row.width) : null,
      height: row.height ? Number(row.height) : null,
      isCollapsed: row.isCollapsed,
      version: row.version,
      lastGeneratedAt: row.lastGeneratedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    };
  }
}
