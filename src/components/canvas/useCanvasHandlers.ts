import { useCallback, useEffect, useRef } from "react";
import { useCanvasStore } from "@/store/canvas";
import type { Connection, Edge, Node } from "reactflow";

interface UseCanvasHandlersOptions {
  mapId: string;
  localEdges: Edge[];
  onEdgesChange: (changes: import("reactflow").EdgeChange[]) => void;
  setLocalEdges: (edges: Edge[] | ((eds: Edge[]) => Edge[])) => void;
}

export function useCanvasHandlers({
  mapId,
  localEdges,
  onEdgesChange,
  setLocalEdges,
}: UseCanvasHandlersOptions) {
  const {
    setNodes,
    setEdges,
    setViewport,
    setSelectedEdgeId,
    removeEdge,
    selectedEdgeId,
  } = useCanvasStore();

  const saveTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const viewportSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleConnect = useCallback(
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

      setLocalEdges((eds) => [...eds, newEdge]);
      setEdges([...localEdges, newEdge as import("@/store/canvas").CanvasEdge]);

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
    [localEdges, setLocalEdges, setEdges, mapId]
  );

  const handleNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const existingTimeout = saveTimeoutRef.current.get(node.id);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      const timeout = setTimeout(async () => {
        try {
          await fetch(`/api/nodes/${node.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              posX: node.position.x,
              posY: node.position.y,
            }),
          });
        } catch (error) {
          console.error("Error guardando posición del nodo:", error);
        } finally {
          saveTimeoutRef.current.delete(node.id);
        }
      }, 500);

      saveTimeoutRef.current.set(node.id, timeout);
    },
    []
  );

  const handleEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      setSelectedEdgeId(edge.id);
    },
    [setSelectedEdgeId]
  );

  const handlePaneClick = useCallback(() => {
    useCanvasStore.getState().setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, [setSelectedEdgeId]);

  const handleMoveEnd = useCallback(
    (_: unknown, viewport: { x: number; y: number; zoom: number }) => {
      setViewport(viewport);

      if (viewportSaveTimeoutRef.current) {
        clearTimeout(viewportSaveTimeoutRef.current);
      }

      viewportSaveTimeoutRef.current = setTimeout(() => {
        fetch(`/api/maps/${mapId}/viewport`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            viewportX: viewport.x,
            viewportY: viewport.y,
            zoom: viewport.zoom,
          }),
        }).catch((error) => {
          console.error("Error guardando viewport:", error);
        });
      }, 2000);
    },
    [setViewport, mapId]
  );

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key === "Delete" && selectedEdgeId) {
        try {
          await fetch(`/api/maps/${mapId}/edges/${selectedEdgeId}`, {
            method: "DELETE",
          });
          removeEdge(selectedEdgeId);
        } catch (error) {
          console.error("Error eliminando arista:", error);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (viewportSaveTimeoutRef.current) {
        clearTimeout(viewportSaveTimeoutRef.current);
      }
    };
  }, [selectedEdgeId, mapId, removeEdge]);

  return {
    handleConnect,
    handleNodeDragStop,
    handleEdgeClick,
    handlePaneClick,
    handleMoveEnd,
  };
}
