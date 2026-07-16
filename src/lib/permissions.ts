import { db } from "@/lib/db";
import { mapCollaborators, mindMaps } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export type Role = "owner" | "editor" | "commenter" | "viewer";

export type Permission =
  | "map.read"
  | "map.update"
  | "map.delete"
  | "map.share"
  | "map.manage_collaborators"
  | "node.create"
  | "node.update"
  | "node.delete"
  | "edge.create"
  | "edge.delete"
  | "research.run"
  | "generation.run";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: [
    "map.read",
    "map.update",
    "map.delete",
    "map.share",
    "map.manage_collaborators",
    "node.create",
    "node.update",
    "node.delete",
    "edge.create",
    "edge.delete",
    "research.run",
    "generation.run",
  ],
  editor: [
    "map.read",
    "node.create",
    "node.update",
    "node.delete",
    "edge.create",
    "edge.delete",
    "research.run",
    "generation.run",
  ],
  commenter: [
    "map.read",
  ],
  viewer: [
    "map.read",
  ],
};

export async function getUserRole(
  mapId: string,
  userId: string
): Promise<Role | null> {
  const [map] = await db
    .select()
    .from(mindMaps)
    .where(eq(mindMaps.id, mapId));

  if (!map) return null;

  if (map.ownerId === userId) {
    return "owner";
  }

  const [collaborator] = await db
    .select()
    .from(mapCollaborators)
    .where(
      and(
        eq(mapCollaborators.mapId, mapId),
        eq(mapCollaborators.userId, userId)
      )
    );

  return collaborator?.role as Role | null;
}

export async function hasPermission(
  mapId: string,
  userId: string,
  permission: Permission
): Promise<boolean> {
  const role = await getUserRole(mapId, userId);
  if (!role) return false;

  return ROLE_PERMISSIONS[role].includes(permission);
}

export async function requirePermission(
  mapId: string,
  userId: string,
  permission: Permission
): Promise<Role> {
  const role = await getUserRole(mapId, userId);
  if (!role) {
    throw new Error("Acceso denegado");
  }

  if (!ROLE_PERMISSIONS[role].includes(permission)) {
    throw new Error("Permiso insuficiente");
  }

  return role;
}
