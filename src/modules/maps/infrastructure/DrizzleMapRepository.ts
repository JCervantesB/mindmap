import { eq, and, isNull, desc, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { mindMaps, mapCollaborators, users } from '@/lib/db/schema';
import type {
  MapRepository,
  CreateMapInput,
  UpdateMapInput,
  MapAccessView,
} from '@/shared/application/repositories';
import type { MindMap, CollaboratorRole } from '@/shared/domain/types';

export class DrizzleMapRepository implements MapRepository {
  async create(input: CreateMapInput): Promise<MindMap> {
    const [result] = await db.insert(mindMaps).values({
      ownerId: input.ownerId,
      title: input.title,
      description: input.description ?? null,
      rootTopic: input.rootTopic,
      purpose: input.purpose ?? null,
      audience: input.audience ?? null,
      knowledgeLevel: input.knowledgeLevel ?? null,
      depthPreference: input.depthPreference ?? null,
      visibility: input.visibility ?? 'private',
      status: input.status ?? 'draft',
    }).returning();

    return this.mapToMindMap(result);
  }

  async findById(id: string): Promise<MindMap | null> {
    const [result] = await db
      .select()
      .from(mindMaps)
      .where(and(eq(mindMaps.id, id), isNull(mindMaps.deletedAt)));

    return result ? this.mapToMindMap(result) : null;
  }

  async findAccessibleMap(mapId: string, userId: string): Promise<MapAccessView | null> {
    const [mapResult] = await db
      .select()
      .from(mindMaps)
      .where(and(eq(mindMaps.id, mapId), isNull(mindMaps.deletedAt)));

    if (!mapResult) return null;

    if (mapResult.ownerId === userId) {
      return {
        map: this.mapToMindMap(mapResult),
        role: 'owner',
        isOwner: true,
      };
    }

    const [collabResult] = await db
      .select()
      .from(mapCollaborators)
      .where(
        and(
          eq(mapCollaborators.mapId, mapId),
          eq(mapCollaborators.userId, userId),
        )
      );

    if (!collabResult) return null;

    return {
      map: this.mapToMindMap(mapResult),
      role: collabResult.role as CollaboratorRole,
      isOwner: false,
    };
  }

  async findByOwnerId(ownerId: string): Promise<MindMap[]> {
    const results = await db
      .select()
      .from(mindMaps)
      .where(and(eq(mindMaps.ownerId, ownerId), isNull(mindMaps.deletedAt)))
      .orderBy(desc(mindMaps.updatedAt));

    return results.map(this.mapToMindMap);
  }

  async update(input: UpdateMapInput): Promise<MindMap> {
    const [result] = await db
      .update(mindMaps)
      .set({
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.rootTopic !== undefined && { rootTopic: input.rootTopic }),
        ...(input.purpose !== undefined && { purpose: input.purpose }),
        ...(input.audience !== undefined && { audience: input.audience }),
        ...(input.knowledgeLevel !== undefined && { knowledgeLevel: input.knowledgeLevel }),
        ...(input.depthPreference !== undefined && { depthPreference: input.depthPreference }),
        ...(input.visibility !== undefined && { visibility: input.visibility }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.lastOpenedAt !== undefined && { lastOpenedAt: input.lastOpenedAt }),
        updatedAt: new Date(),
      })
      .where(eq(mindMaps.id, input.id))
      .returning();

    return this.mapToMindMap(result);
  }

  async updateVersion(id: string, expectedVersion: number): Promise<MindMap> {
    const [result] = await db
      .update(mindMaps)
      .set({
        currentVersion: sql`${mindMaps.currentVersion} + 1`,
        updatedAt: new Date(),
      })
      .where(and(eq(mindMaps.id, id), eq(mindMaps.currentVersion, expectedVersion)))
      .returning();

    return this.mapToMindMap(result);
  }

  async softDelete(id: string): Promise<void> {
    await db
      .update(mindMaps)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(mindMaps.id, id));
  }

  private mapToMindMap(row: typeof mindMaps.$inferSelect): MindMap {
    return {
      id: row.id,
      ownerId: row.ownerId,
      title: row.title,
      description: row.description,
      rootTopic: row.rootTopic,
      purpose: row.purpose as MindMap['purpose'],
      audience: row.audience,
      knowledgeLevel: row.knowledgeLevel as MindMap['knowledgeLevel'],
      depthPreference: row.depthPreference as MindMap['depthPreference'],
      visibility: row.visibility as MindMap['visibility'],
      status: row.status as MindMap['status'],
      currentVersion: row.currentVersion,
      settingsJson: row.settingsJson,
      lastOpenedAt: row.lastOpenedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    };
  }
}
