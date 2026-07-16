import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { mapEdges } from '@/lib/db/schema';
import type {
  EdgeRepository,
  CreateEdgeInput,
} from '@/shared/application/repositories';
import type { MapEdge } from '@/shared/domain/types';

export class DrizzleEdgeRepository implements EdgeRepository {
  async create(input: CreateEdgeInput): Promise<MapEdge> {
    const [result] = await db.insert(mapEdges).values({
      mapId: input.mapId,
      sourceNodeId: input.sourceNodeId,
      targetNodeId: input.targetNodeId,
      relationType: input.relationType ?? 'structural',
      label: input.label ?? null,
      createdBy: input.createdBy,
      updatedBy: input.updatedBy,
    }).returning();

    return this.mapToEdge(result);
  }

  async findById(id: string): Promise<MapEdge | null> {
    const [result] = await db
      .select()
      .from(mapEdges)
      .where(eq(mapEdges.id, id));

    return result ? this.mapToEdge(result) : null;
  }

  async findByMapId(mapId: string): Promise<MapEdge[]> {
    const results = await db
      .select()
      .from(mapEdges)
      .where(eq(mapEdges.mapId, mapId));

    return results.map(this.mapToEdge);
  }

  async delete(id: string): Promise<void> {
    await db.delete(mapEdges).where(eq(mapEdges.id, id));
  }

  private mapToEdge(row: typeof mapEdges.$inferSelect): MapEdge {
    return {
      id: row.id,
      mapId: row.mapId,
      sourceNodeId: row.sourceNodeId,
      targetNodeId: row.targetNodeId,
      relationType: row.relationType as MapEdge['relationType'],
      label: row.label,
      styleJson: row.styleJson,
      createdBy: row.createdBy,
      updatedBy: row.updatedBy,
      version: row.version,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
