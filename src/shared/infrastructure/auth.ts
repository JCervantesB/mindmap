import { db } from '@/lib/db';
import { mindMaps, mapCollaborators } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import type {
  CurrentUserProvider,
  AuthenticatedUser,
  PermissionEvaluator,
  DomainAction,
  ResourceRef,
} from '@/shared/application/providers';
import type { CollaboratorRole } from '@/shared/domain/types';
import { auth } from '@clerk/nextjs/server';

export class ClerkCurrentUserProvider implements CurrentUserProvider {
  async getCurrentUser(): Promise<AuthenticatedUser | null> {
    const { userId } = await auth();
    if (!userId) return null;

    const { db } = await import('@/lib/db');
    const { users } = await import('@/lib/db/schema');
    const { eq } = await import('drizzle-orm');

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, userId));

    if (!user) return null;

    return {
      id: user.id,
      clerkUserId: user.clerkUserId,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    };
  }

  async requireCurrentUser(): Promise<AuthenticatedUser> {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error('Unauthorized: No authenticated user');
    }
    return user;
  }
}

const roleHierarchy: Record<CollaboratorRole, number> = {
  owner: 4,
  editor: 3,
  commenter: 2,
  viewer: 1,
};

const actionPermissions: Record<DomainAction, CollaboratorRole[]> = {
  'map.read': ['owner', 'editor', 'commenter', 'viewer'],
  'map.update': ['owner', 'editor'],
  'map.delete': ['owner'],
  'map.share': ['owner'],
  'map.manage_collaborators': ['owner'],
  'node.create': ['owner', 'editor'],
  'node.update': ['owner', 'editor'],
  'node.delete': ['owner', 'editor'],
  'edge.create': ['owner', 'editor'],
  'edge.delete': ['owner', 'editor'],
  'research.run': ['owner', 'editor'],
  'generation.run': ['owner', 'editor'],
};

export class DrizzlePermissionEvaluator implements PermissionEvaluator {
  async getRole(userId: string, resource: ResourceRef): Promise<CollaboratorRole | 'owner' | null> {
    if (resource.type === 'map') {
      if (resource.ownerId && resource.ownerId === userId) {
        return 'owner';
      }

      const [collaborator] = await db
        .select()
        .from(mapCollaborators)
        .where(
          and(
            eq(mapCollaborators.mapId, resource.id),
            eq(mapCollaborators.userId, userId),
          )
        );

      return collaborator ? collaborator.role as CollaboratorRole : null;
    }

    return null;
  }

  async ensureCan(userId: string, action: DomainAction, resource: ResourceRef): Promise<void> {
    const hasPermission = await this.can(userId, action, resource);
    if (!hasPermission) {
      throw new Error(`Forbidden: User ${userId} cannot perform ${action} on ${resource.type}:${resource.id}`);
    }
  }

  async can(userId: string, action: DomainAction, resource: ResourceRef): Promise<boolean> {
    const role = await this.getRole(userId, resource);
    if (!role) return false;

    const requiredRoles = actionPermissions[action];
    if (!requiredRoles) return false;

    return requiredRoles.includes(role);
  }
}
