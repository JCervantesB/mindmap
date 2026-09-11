import { create } from 'zustand';
import type { Node, Edge, Viewport } from 'reactflow';

export type CanvasNode = Node & {
  width?: number;
  height?: number;
  data: {
    id: string;
    title: string;
    shortSummary?: string;
    contentMarkdown?: string;
    nodeType: string;
    generationMode: string;
    editorialStatus: string;
    version: number;
    isCollapsed: boolean;
    childCount: number;
    position: number;
    nodeWidth?: number;
    nodeHeight?: number;
    parentNodeId?: string | null;
    onToggleCollapse?: (nodeId: string) => void;
    onResize?: (nodeId: string, width: number, height: number) => void;
  };
};

export type CanvasEdge = Edge & {
  data?: {
    relationType: string;
    label?: string;
  };
};

interface CanvasSnapshot {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  collapsedNodes: string[];
}

interface CanvasState {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  viewport: Viewport;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  isDragging: boolean;
  isConnecting: boolean;
  minimapOpen: boolean;
  collapsedNodes: string[];
  past: CanvasSnapshot[];
  future: CanvasSnapshot[];

  setNodes: (nodes: CanvasNode[]) => void;
  setEdges: (edges: CanvasEdge[]) => void;
  addNode: (node: CanvasNode) => void;
  updateNode: (nodeId: string, updates: Partial<CanvasNode>) => void;
  removeNode: (nodeId: string) => void;
  addEdge: (edge: CanvasEdge) => void;
  removeEdge: (edgeId: string) => void;
  removeEdgesForNodes: (nodeIds: string[]) => void;
  setViewport: (viewport: Viewport) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  setSelectedEdgeId: (edgeId: string | null) => void;
  setIsDragging: (isDragging: boolean) => void;
  setIsConnecting: (isConnecting: boolean) => void;
  toggleMinimap: () => void;
  toggleNodeCollapse: (nodeId: string) => void;
  setCollapsedNodes: (collapsedNodes: string[]) => void;
  resetCanvas: () => void;
  undo: () => void;
  redo: () => void;
}

function captureSnapshot(state: CanvasState): CanvasSnapshot {
  return {
    nodes: state.nodes,
    edges: state.edges,
    collapsedNodes: state.collapsedNodes,
  };
}

function sameSnapshot(a: CanvasSnapshot, b: CanvasSnapshot): boolean {
  return a.nodes === b.nodes && a.edges === b.edges && a.collapsedNodes === b.collapsedNodes;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  selectedNodeId: null,
  selectedEdgeId: null,
  isDragging: false,
  isConnecting: false,
  minimapOpen: true,
  collapsedNodes: [],
  past: [],
  future: [],

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  addNode: (node) => set((state) => {
    const snapshot = captureSnapshot(state);
    return {
      nodes: [...state.nodes, node],
      past: sameSnapshot(state.past[state.past.length - 1], snapshot)
        ? state.past
        : [...state.past.slice(-49), snapshot],
      future: [],
    };
  }),

  updateNode: (nodeId, updates) => set((state) => ({
    nodes: state.nodes.map((node) =>
      node.id === nodeId ? { ...node, ...updates } : node
    ),
  })),

  removeNode: (nodeId) => set((state) => {
    const snapshot = captureSnapshot(state);
    return {
      nodes: state.nodes.filter((node) => node.id !== nodeId),
      edges: state.edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      ),
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
      past: sameSnapshot(state.past[state.past.length - 1], snapshot)
        ? state.past
        : [...state.past.slice(-49), snapshot],
      future: [],
    };
  }),

  addEdge: (edge) => set((state) => {
    const snapshot = captureSnapshot(state);
    return {
      edges: [...state.edges, edge],
      past: sameSnapshot(state.past[state.past.length - 1], snapshot)
        ? state.past
        : [...state.past.slice(-49), snapshot],
      future: [],
    };
  }),

  removeEdge: (edgeId) => set((state) => {
    const snapshot = captureSnapshot(state);
    return {
      edges: state.edges.filter((edge) => edge.id !== edgeId),
      selectedEdgeId: state.selectedEdgeId === edgeId ? null : state.selectedEdgeId,
      past: sameSnapshot(state.past[state.past.length - 1], snapshot)
        ? state.past
        : [...state.past.slice(-49), snapshot],
      future: [],
    };
  }),

  removeEdgesForNodes: (nodeIds) => set((state) => {
    const snapshot = captureSnapshot(state);
    return {
      edges: state.edges.filter(
        (edge) => !nodeIds.includes(edge.source) && !nodeIds.includes(edge.target)
      ),
      past: sameSnapshot(state.past[state.past.length - 1], snapshot)
        ? state.past
        : [...state.past.slice(-49), snapshot],
      future: [],
    };
  }),

  setViewport: (viewport) => set({ viewport }),
  setSelectedNodeId: (selectedNodeId) => set({ selectedNodeId, selectedEdgeId: null }),
  setSelectedEdgeId: (selectedEdgeId) => set({ selectedEdgeId, selectedNodeId: null }),
  setIsDragging: (isDragging) => set((state) => {
    if (!isDragging) return { isDragging };
    const snapshot = captureSnapshot(state);
    return {
      isDragging,
      past: sameSnapshot(state.past[state.past.length - 1], snapshot)
        ? state.past
        : [...state.past.slice(-49), snapshot],
      future: [],
    };
  }),
  setIsConnecting: (isConnecting) => set({ isConnecting }),
  toggleMinimap: () => set((state) => ({ minimapOpen: !state.minimapOpen })),

  setCollapsedNodes: (collapsedNodes) => set({ collapsedNodes }),

  toggleNodeCollapse: (nodeId) => {
    const state = get();
    const node = state.nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const isCurrentlyCollapsed = state.collapsedNodes.includes(nodeId);
    const newCollapsedNodes = isCurrentlyCollapsed
      ? state.collapsedNodes.filter((id) => id !== nodeId)
      : [...state.collapsedNodes, nodeId];

    const childIds = new Set<string>();
    const findChildren = (parentId: string) => {
      state.edges.forEach((edge) => {
        if (edge.source === parentId && !childIds.has(edge.target)) {
          childIds.add(edge.target);
          findChildren(edge.target);
        }
      });
    };
    findChildren(nodeId);

    set((prev) => ({
      past: sameSnapshot(prev.past[prev.past.length - 1], captureSnapshot(prev))
        ? prev.past
        : [...prev.past.slice(-49), captureSnapshot(prev)],
      future: [],
      collapsedNodes: newCollapsedNodes,
      nodes: state.nodes.map((n) => {
        if (n.id === nodeId) {
          return {
            ...n,
            data: { ...n.data, isCollapsed: !isCurrentlyCollapsed },
          };
        }
        if (childIds.has(n.id)) {
          return {
            ...n,
            hidden: !isCurrentlyCollapsed,
          };
        }
        return n;
      }),
      edges: state.edges.map((e) => ({
        ...e,
        hidden: childIds.has(e.source) || childIds.has(e.target) ? !isCurrentlyCollapsed : e.hidden,
      })),
    }));
  },

  resetCanvas: () => set({
    nodes: [],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 },
    selectedNodeId: null,
    selectedEdgeId: null,
    collapsedNodes: [],
    past: [],
    future: [],
  }),

  undo: () => set((state) => {
    const snapshot = state.past[state.past.length - 1];
    if (!snapshot) return state;
    return {
      nodes: snapshot.nodes,
      edges: snapshot.edges,
      collapsedNodes: snapshot.collapsedNodes,
      past: state.past.slice(0, -1),
      future: [...state.future, captureSnapshot(state)],
    };
  }),

  redo: () => set((state) => {
    const snapshot = state.future[state.future.length - 1];
    if (!snapshot) return state;
    return {
      nodes: snapshot.nodes,
      edges: snapshot.edges,
      collapsedNodes: snapshot.collapsedNodes,
      future: state.future.slice(0, -1),
      past: [...state.past, captureSnapshot(state)],
    };
  }),
}));
