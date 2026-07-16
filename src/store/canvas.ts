import { create } from 'zustand';
import type { Node, Edge, Viewport } from 'reactflow';

export type CanvasNode = Node & {
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
    parentNodeId?: string | null;
    onToggleCollapse?: (nodeId: string) => void;
  };
};

export type CanvasEdge = Edge & {
  data?: {
    relationType: string;
    label?: string;
  };
};

interface CanvasState {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  viewport: Viewport;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  isDragging: boolean;
  isConnecting: boolean;
  minimapOpen: boolean;

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
  resetCanvas: () => void;
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

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  addNode: (node) => set((state) => ({
    nodes: [...state.nodes, node],
  })),

  updateNode: (nodeId, updates) => set((state) => ({
    nodes: state.nodes.map((node) =>
      node.id === nodeId ? { ...node, ...updates } : node
    ),
  })),

  removeNode: (nodeId) => set((state) => ({
    nodes: state.nodes.filter((node) => node.id !== nodeId),
    edges: state.edges.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId
    ),
    selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
  })),

  addEdge: (edge) => set((state) => ({
    edges: [...state.edges, edge],
  })),

  removeEdge: (edgeId) => set((state) => ({
    edges: state.edges.filter((edge) => edge.id !== edgeId),
    selectedEdgeId: state.selectedEdgeId === edgeId ? null : state.selectedEdgeId,
  })),

  removeEdgesForNodes: (nodeIds) => set((state) => ({
    edges: state.edges.filter(
      (edge) => !nodeIds.includes(edge.source) && !nodeIds.includes(edge.target)
    ),
  })),

  setViewport: (viewport) => set({ viewport }),
  setSelectedNodeId: (selectedNodeId) => set({ selectedNodeId, selectedEdgeId: null }),
  setSelectedEdgeId: (selectedEdgeId) => set({ selectedEdgeId, selectedNodeId: null }),
  setIsDragging: (isDragging) => set({ isDragging }),
  setIsConnecting: (isConnecting) => set({ isConnecting }),
  toggleMinimap: () => set((state) => ({ minimapOpen: !state.minimapOpen })),

  toggleNodeCollapse: (nodeId) => {
    const state = get();
    const node = state.nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const newCollapsedState = !node.data.isCollapsed;

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

    set({
      nodes: state.nodes.map((n) => {
        if (n.id === nodeId) {
          return {
            ...n,
            data: { ...n.data, isCollapsed: newCollapsedState },
          };
        }
        if (childIds.has(n.id)) {
          return {
            ...n,
            hidden: newCollapsedState,
          };
        }
        return n;
      }),
      edges: state.edges.map((e) => ({
        ...e,
        hidden: childIds.has(e.source) || childIds.has(e.target) ? newCollapsedState : e.hidden,
      })),
    });
  },

  resetCanvas: () => set({
    nodes: [],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 },
    selectedNodeId: null,
    selectedEdgeId: null,
  }),
}));
