import type { CanvasNode, CanvasEdge } from "@/store/canvas";

interface LayoutOptions {
  direction?: "LR" | "TB";
  nodeWidth?: number;
  nodeHeight?: number;
  horizontalSpacing?: number;
  verticalSpacing?: number;
  useExistingPositions?: boolean;
}

export function getLayoutedElements(
  nodes: CanvasNode[],
  edges: CanvasEdge[],
  options: LayoutOptions = {}
): { nodes: CanvasNode[]; edges: CanvasEdge[] } {
  const {
    direction = "LR",
    nodeWidth = 200,
    nodeHeight = 80,
    horizontalSpacing = 100,
    verticalSpacing = 50,
    useExistingPositions = false,
  } = options;

  if (useExistingPositions) {
    return { nodes, edges };
  }

  if (nodes.length === 0) {
    return { nodes, edges };
  }

  const rootNode = nodes.find((n) => n.data.nodeType === "root");
  if (!rootNode) {
    return { nodes, edges };
  }

  const childCountMap = new Map<string, number>();
  nodes.forEach((node) => {
    if (node.data.parentNodeId) {
      const count = childCountMap.get(node.data.parentNodeId) || 0;
      childCountMap.set(node.data.parentNodeId, count + 1);
    }
  });

  const levelsMap = new Map<string, number>();
  const visited = new Set<string>();

  const assignLevels = (nodeId: string, level: number) => {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    levelsMap.set(nodeId, level);

    const childEdges = edges
      .filter((e) => e.source === nodeId)
      .sort((a, b) => {
        const nodeA = nodes.find((n) => n.id === a.target);
        const nodeB = nodes.find((n) => n.id === b.target);
        const posA = nodeA?.data.position ?? 0;
        const posB = nodeB?.data.position ?? 0;
        return posA - posB;
      });

    childEdges.forEach((edge) => {
      assignLevels(edge.target, level + 1);
    });
  };

  assignLevels(rootNode.id, 0);

  const nodesByLevel = new Map<number, CanvasNode[]>();
  nodes.forEach((node) => {
    const level = levelsMap.get(node.id) || 0;
    if (!nodesByLevel.has(level)) {
      nodesByLevel.set(level, []);
    }
    nodesByLevel.get(level)!.push(node);
  });

  nodesByLevel.forEach((levelNodes) => {
    levelNodes.sort((a, b) => (a.data.position || 0) - (b.data.position || 0));
  });

  const isHorizontal = direction === "LR";

  const layoutedNodes = nodes.map((node) => {
    const level = levelsMap.get(node.id) || 0;
    const siblings = nodesByLevel.get(level) || [];
    const indexInLevel = siblings.findIndex((n) => n.id === node.id);

    let x: number;
    let y: number;

    if (isHorizontal) {
      x = level * (nodeWidth + horizontalSpacing);
      const totalHeight = siblings.length * nodeHeight + (siblings.length - 1) * verticalSpacing;
      const startY = (totalHeight - siblings.length * nodeHeight) / 2;
      y = startY + indexInLevel * (nodeHeight + verticalSpacing);
    } else {
      y = level * (nodeHeight + verticalSpacing);
      const totalWidth = siblings.length * nodeWidth + (siblings.length - 1) * horizontalSpacing;
      const startX = (totalWidth - siblings.length * nodeWidth) / 2;
      x = startX + indexInLevel * (nodeWidth + horizontalSpacing);
    }

    return {
      ...node,
      position: { x, y },
    };
  });

  return { nodes: layoutedNodes, edges };
}
