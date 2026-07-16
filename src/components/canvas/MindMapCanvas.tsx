"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";

import { useCanvasStore, CanvasNode, CanvasEdge } from "@/store/canvas";
import { MindMapNode } from "./MindMapNode";
import { MindMapEdge } from "./MindMapEdge";
import { useCanvasHandlers } from "./useCanvasHandlers";

interface MindMapCanvasProps {
  mapId: string;
  onNodeSelect?: (nodeId: string | null) => void;
}

function FlowCanvas({ mapId, onNodeSelect }: MindMapCanvasProps) {
  const nodeTypes = useMemo(
    () => ({
      mindMapNode: MindMapNode,
    }),
    []
  );

  const edgeTypes = useMemo(
    () => ({
      mindMapEdge: MindMapEdge,
    }),
    []
  );

  const {
    nodes: storeNodes,
    edges: storeEdges,
    setNodes: setStoreNodes,
    setEdges: setStoreEdges,
    minimapOpen,
    toggleNodeCollapse,
  } = useCanvasStore();

  const [localNodes, setLocalNodes, onNodesChange] = useNodesState(storeNodes);
  const [localEdges, setLocalEdges, onEdgesChange] = useEdgesState(storeEdges);

  const {
    handleConnect,
    handleNodeDragStop,
    handleEdgeClick,
    handlePaneClick,
    handleMoveEnd,
  } = useCanvasHandlers({
    mapId,
    localEdges,
    onEdgesChange,
    setLocalEdges,
  });

  useEffect(() => {
    const nodesWithCollapseHandler = storeNodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onToggleCollapse: toggleNodeCollapse,
      },
    }));
    setLocalNodes(nodesWithCollapseHandler);
  }, [storeNodes, setLocalNodes, toggleNodeCollapse]);

  useEffect(() => {
    setLocalEdges(storeEdges);
  }, [storeEdges, setLocalEdges]);

  const onNodesChangeHandler = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);
      const updatedNodes = applyNodeChanges(changes, localNodes);
      setStoreNodes(updatedNodes as CanvasNode[]);
    },
    [onNodesChange, localNodes, setStoreNodes]
  );

  const onEdgesChangeHandler = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(changes);
      const updatedEdges = applyEdgeChanges(changes, localEdges);
      setStoreEdges(updatedEdges as CanvasEdge[]);
    },
    [onEdgesChange, localEdges, setStoreEdges]
  );

  const onConnectInternal = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      const edgeId = `e-${connection.source}-${connection.target}-${Date.now()}`;
      const newEdge = {
        ...connection,
        id: edgeId,
        type: "mindMapEdge",
        source: connection.source,
        target: connection.target,
      } as Edge;

      setLocalEdges((eds) => addEdge(newEdge, eds));
      setStoreEdges([...localEdges, newEdge as CanvasEdge]);

      fetch(`/api/maps/${mapId}/edges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceNodeId: connection.source,
          targetNodeId: connection.target,
          relationType: "structural",
        }),
      }).catch((error) => {
        console.error("Error guardando edge:", error);
      });
    },
    [localEdges, setLocalEdges, setStoreEdges, mapId]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      useCanvasStore.getState().setSelectedNodeId(node.id);
      onNodeSelect?.(node.id);
    },
    [onNodeSelect]
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={localNodes}
        edges={localEdges}
        onNodesChange={onNodesChangeHandler}
        onEdgesChange={onEdgesChangeHandler}
        onConnect={handleConnect}
        onNodeDragStop={handleNodeDragStop}
        onNodeClick={onNodeClick}
        onEdgeClick={handleEdgeClick}
        onPaneClick={handlePaneClick}
        onMoveEnd={handleMoveEnd}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        snapToGrid
        snapGrid={[16, 16]}
        defaultEdgeOptions={{
          type: "mindMapEdge",
        }}
      >
        <Background gap={16} size={1} />
        <Controls />
        {minimapOpen && (
          <MiniMap
            nodeStrokeWidth={3}
            zoomable
            pannable
          />
        )}
      </ReactFlow>
    </div>
  );
}

export function MindMapCanvas({ mapId, onNodeSelect }: MindMapCanvasProps) {
  return (
    <ReactFlowProvider>
      <FlowCanvas mapId={mapId} onNodeSelect={onNodeSelect} />
    </ReactFlowProvider>
  );
}
