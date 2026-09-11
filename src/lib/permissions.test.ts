import { describe, it, expect, vi, beforeEach } from "vitest";
import { mindMaps, mapCollaborators } from "@/lib/db/schema";

const mock = vi.hoisted(() => {
  const tableResults: { table: unknown; rows: unknown[] }[] = [];
  const db = {
    select: () => ({
      from: (table: unknown) => ({
        where: () => {
          const entry = tableResults.find((e) => e.table === table);
          return Promise.resolve(entry ? entry.rows : []);
        },
      }),
    }),
  };
  return { db, tableResults };
});

vi.mock("@/lib/db", () => ({ db: mock.db }));

import {
  getUserRole,
  hasPermission,
  requirePermission,
  PermissionError,
} from "./permissions";

describe("getUserRole", () => {
  beforeEach(() => {
    mock.tableResults.length = 0;
  });

  it("returns owner when the user owns the map", async () => {
    mock.tableResults.push({ table: mindMaps, rows: [{ id: "m1", ownerId: "u1" }] });
    const role = await getUserRole("m1", "u1");
    expect(role).toBe("owner");
  });

  it("returns collaborator role when not the owner", async () => {
    mock.tableResults.push({ table: mindMaps, rows: [{ id: "m1", ownerId: "u1" }] });
    mock.tableResults.push({
      table: mapCollaborators,
      rows: [{ mapId: "m1", userId: "u2", role: "editor" }],
    });
    const role = await getUserRole("m1", "u2");
    expect(role).toBe("editor");
  });

  it("returns null when the map does not exist", async () => {
    const role = await getUserRole("missing", "u1");
    expect(role).toBeNull();
  });

  it("returns null when the user is not a collaborator", async () => {
    mock.tableResults.push({ table: mindMaps, rows: [{ id: "m1", ownerId: "u1" }] });
    mock.tableResults.push({ table: mapCollaborators, rows: [] });
    const role = await getUserRole("m1", "u3");
    expect(role).toBeNull();
  });
});

describe("hasPermission", () => {
  beforeEach(() => {
    mock.tableResults.length = 0;
  });

  it("gives editors node.update but not map.delete", async () => {
    mock.tableResults.push({ table: mindMaps, rows: [{ id: "m1", ownerId: "u1" }] });
    mock.tableResults.push({
      table: mapCollaborators,
      rows: [{ mapId: "m1", userId: "u2", role: "editor" }],
    });
    expect(await hasPermission("m1", "u2", "node.update")).toBe(true);
    expect(await hasPermission("m1", "u2", "map.delete")).toBe(false);
  });

  it("gives viewers only map.read", async () => {
    mock.tableResults.push({ table: mindMaps, rows: [{ id: "m1", ownerId: "u1" }] });
    mock.tableResults.push({
      table: mapCollaborators,
      rows: [{ mapId: "m1", userId: "u3", role: "viewer" }],
    });
    expect(await hasPermission("m1", "u3", "map.read")).toBe(true);
    expect(await hasPermission("m1", "u3", "node.create")).toBe(false);
  });
});

describe("requirePermission", () => {
  beforeEach(() => {
    mock.tableResults.length = 0;
  });

  it("throws PermissionError when access is denied", async () => {
    await expect(requirePermission("m1", "u9", "map.read")).rejects.toBeInstanceOf(
      PermissionError
    );
  });

  it("throws PermissionError when permission is insufficient", async () => {
    mock.tableResults.push({ table: mindMaps, rows: [{ id: "m1", ownerId: "u1" }] });
    mock.tableResults.push({
      table: mapCollaborators,
      rows: [{ mapId: "m1", userId: "u3", role: "viewer" }],
    });
    await expect(requirePermission("m1", "u3", "generation.run")).rejects.toBeInstanceOf(
      PermissionError
    );
  });

  it("resolves with the role when permitted", async () => {
    mock.tableResults.push({ table: mindMaps, rows: [{ id: "m1", ownerId: "u1" }] });
    const role = await requirePermission("m1", "u1", "map.delete");
    expect(role).toBe("owner");
  });
});