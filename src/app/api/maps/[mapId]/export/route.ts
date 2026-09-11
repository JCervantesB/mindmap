import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, mindMaps, mapNodes, mapEdges } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { requirePermission } from "@/lib/permissions";
import { handleApiError } from "@/lib/errors";

type FlatNode = {
  id: string;
  parentNodeId: string | null;
  nodeType: string;
  title: string;
  shortSummary: string | null;
  contentMarkdown: string | null;
  depth: number;
  hierarchyPath: string | null;
};

function nodeToMarkdown(node: FlatNode, depth: number): string {
  const headingLevel = Math.min(depth + 1, 6);
  const lines: string[] = [`${"#".repeat(headingLevel)} ${node.title}`];
  if (node.shortSummary) lines.push("", node.shortSummary);
  if (node.contentMarkdown) lines.push("", node.contentMarkdown);
  lines.push("");
  return lines.join("\n");
}

function toMarkdown(map: { title: string; rootTopic: string }, nodes: FlatNode[]): string {
  const seen = new Set<string>();
  const out: string[] = [`# ${map.title}`, "", `> Tema raíz: ${map.rootTopic}`, ""];

  const byParent = new Map<string | null, FlatNode[]>();
  nodes.forEach((n) => {
    const key = n.parentNodeId;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(n);
  });

  const walk = (node: FlatNode, depth: number) => {
    if (seen.has(node.id)) return;
    seen.add(node.id);
    out.push(nodeToMarkdown(node, depth));
    const children = (byParent.get(node.id) ?? []).sort((a, b) =>
      (a.hierarchyPath ?? "").localeCompare(b.hierarchyPath ?? "", undefined, { numeric: true })
    );
    children.forEach((c) => walk(c, depth + 1));
  };

  const roots = (byParent.get(null) ?? []).sort((a, b) =>
      (a.hierarchyPath ?? "").localeCompare(b.hierarchyPath ?? "", undefined, { numeric: true })
    );
    roots.forEach((r) => walk(r, 0));

  return out.join("\n").trim() + "\n";
}

function toJson(map: unknown, nodes: unknown, edges: unknown): string {
  return JSON.stringify({ map, nodes, edges }, null, 2);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mapId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { mapId } = await params;
    const format = request.nextUrl.searchParams.get("format") ?? "markdown";

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, userId));

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    await requirePermission(mapId, user.id, "map.read");

    const [map] = await db
      .select()
      .from(mindMaps)
      .where(and(eq(mindMaps.id, mapId), isNull(mindMaps.deletedAt)));

    if (!map) {
      return NextResponse.json({ error: "Mapa no encontrado" }, { status: 404 });
    }

    const nodes = await db
      .select()
      .from(mapNodes)
      .where(and(eq(mapNodes.mapId, mapId), isNull(mapNodes.deletedAt)));

    const edges = await db
      .select()
      .from(mapEdges)
      .where(eq(mapEdges.mapId, mapId));

    const flatNodes: FlatNode[] = nodes.map((n) => ({
      id: n.id,
      parentNodeId: n.parentNodeId,
      nodeType: n.nodeType,
      title: n.title,
      shortSummary: n.shortSummary,
      contentMarkdown: n.contentMarkdown,
      depth: n.depth,
      hierarchyPath: n.hierarchyPath,
    }));

    const filename = (map.title || "mapa").replace(/[^\w\u00C0-\uFFFF-]+/g, "_");

    if (format === "json") {
      return new NextResponse(toJson(map, nodes, edges), {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}.json"`,
        },
      });
    }

    const markdown = toMarkdown(map, flatNodes);
    return new NextResponse(markdown, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}.md"`,
      },
    });
  } catch (error) {
    console.error("Error exportando mapa:", error);
    return handleApiError(error);
  }
}