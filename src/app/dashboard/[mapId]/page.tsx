"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Brain, ArrowLeft, Maximize2, Loader2, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MindMapCanvas } from "@/components/canvas/MindMapCanvas";
import { NodeDetailPanel } from "@/components/panels/NodeDetailPanel";
import { CollaboratorDialog } from "@/components/CollaboratorDialog";
import { useCanvasStore, CanvasNode, CanvasEdge } from "@/store/canvas";
import { useUIStore } from "@/store/ui";
import { getLayoutedElements } from "@/lib/layout";

export default function MapEditorPage() {
  const params = useParams();
  const mapId = params.mapId as string;
  const [isLoading, setIsLoading] = useState(true);
  const { setNodes, setEdges, setViewport, toggleNodeCollapse, selectedNodeId, nodes, viewport } = useCanvasStore();
  const { setDetailPanelOpen, detailPanelOpen, addToast } = useUIStore();
  const [isCreatingNode, setIsCreatingNode] = useState(false);
  const [collaboratorDialogOpen, setCollaboratorDialogOpen] = useState(false);

  useEffect(() => {
    async function loadMap() {
      try {
        const [mapResponse, viewportResponse] = await Promise.all([
          fetch(`/api/maps/${mapId}`),
          fetch(`/api/maps/${mapId}/viewport`).catch(() => null),
        ]);

        if (mapResponse.ok) {
          const data = await mapResponse.json();
          let canvasNodes: CanvasNode[] = [];

          if (data.nodes) {
            const childCountMap = new Map<string, number>();
            if (data.edges) {
              data.edges.forEach((edge: { sourceNodeId: string }) => {
                const count = childCountMap.get(edge.sourceNodeId) || 0;
                childCountMap.set(edge.sourceNodeId, count + 1);
              });
            }

            canvasNodes = data.nodes.map((node: {
              id: string;
              parentNodeId: string | null;
              posX: number;
              posY: number;
              title: string;
              nodeType: string;
              shortSummary?: string;
              contentMarkdown?: string;
              generationMode: string;
              editorialStatus: string;
              version: number;
              isCollapsed: boolean;
              childCount: number;
              position: number;
            }) => ({
              id: node.id,
              position: { x: node.posX, y: node.posY },
              type: "mindMapNode",
              data: {
                id: node.id,
                title: node.title,
                nodeType: node.nodeType,
                shortSummary: node.shortSummary,
                contentMarkdown: node.contentMarkdown,
                generationMode: node.generationMode,
                editorialStatus: node.editorialStatus,
                version: node.version,
                position: node.position,
                isCollapsed: node.isCollapsed,
                childCount: childCountMap.get(node.id) || 0,
                parentNodeId: node.parentNodeId,
                onToggleCollapse: toggleNodeCollapse,
              },
            }));
          }

          if (data.edges && canvasNodes.length > 0) {
            const canvasEdges: CanvasEdge[] = data.edges.map((edge: {
              id: string;
              sourceNodeId: string;
              targetNodeId: string;
              relationType: string;
              label?: string;
            }) => ({
              id: edge.id,
              source: edge.sourceNodeId,
              target: edge.targetNodeId,
              type: "mindMapEdge",
              data: {
                relationType: edge.relationType,
                label: edge.label,
              },
            }));

            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
              canvasNodes,
              canvasEdges,
              { direction: "LR", useExistingPositions: true }
            );

            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
          } else {
            setNodes(canvasNodes);
          }
        }

        if (viewportResponse?.ok) {
          const viewportData = await viewportResponse.json();
          if (viewportData.viewportX !== undefined) {
            setViewport({
              x: viewportData.viewportX,
              y: viewportData.viewportY,
              zoom: viewportData.zoom,
            });
          }
        }
      } catch (error) {
        console.error("Failed to load map:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (mapId) {
      loadMap();
    }
  }, [mapId, setNodes, setEdges, setViewport]);

  useEffect(() => {
    if (selectedNodeId) {
      setDetailPanelOpen(true);
    }
  }, [selectedNodeId, setDetailPanelOpen]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentViewport = useCanvasStore.getState().viewport;
      navigator.sendBeacon(`/api/maps/${mapId}/viewport`, JSON.stringify({
        viewportX: currentViewport.x,
        viewportY: currentViewport.y,
        zoom: currentViewport.zoom,
      }));
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [mapId]);

  const handleCreateNode = async () => {
    setIsCreatingNode(true);
    try {
      const viewportCenterX = -viewport.x + (window.innerWidth / 2) / viewport.zoom;
      const viewportCenterY = -viewport.y + (window.innerHeight / 2) / viewport.zoom;

      const response = await fetch(`/api/maps/${mapId}/nodes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Nuevo nodo",
          nodeType: "concept",
          posX: viewportCenterX + (Math.random() - 0.5) * 50,
          posY: viewportCenterY + (Math.random() - 0.5) * 50,
        }),
      });

      if (!response.ok) {
        throw new Error("Error creando nodo");
      }

      const newNode = await response.json();

      const canvasNode: CanvasNode = {
        id: newNode.id,
        position: { x: Number(newNode.posX), y: Number(newNode.posY) },
        type: "mindMapNode",
        data: {
          id: newNode.id,
          title: newNode.title,
          nodeType: newNode.nodeType,
          shortSummary: newNode.shortSummary,
          contentMarkdown: newNode.contentMarkdown,
          generationMode: newNode.generationMode,
          editorialStatus: newNode.editorialStatus,
          version: newNode.version,
          position: newNode.position,
          isCollapsed: newNode.isCollapsed,
          childCount: 0,
          parentNodeId: newNode.parentNodeId,
          onToggleCollapse: toggleNodeCollapse,
        },
      };

      setNodes([...nodes, canvasNode]);
      useCanvasStore.getState().setSelectedNodeId(newNode.id);
      addToast({ type: "success", message: "Nodo creado" });
    } catch (error) {
      console.error("Error creando nodo:", error);
      addToast({ type: "error", message: "Error al crear el nodo" });
    } finally {
      setIsCreatingNode(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 items-center justify-between border-b bg-card px-4">
        <div className="flex items-center gap-4">
          <a href="/dashboard">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </a>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <span className="font-medium">Editor de mapa</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleCreateNode} disabled={isCreatingNode}>
            <Plus className="h-4 w-4" />
            Nuevo nodo
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setCollaboratorDialogOpen(true)}>
            <Users className="h-4 w-4" />
            Compartir
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Maximize2 className="h-4 w-4" />
            Pantalla completa
          </Button>
        </div>
      </header>

      <div className="flex-1 flex bg-muted/30">
        <div className="flex-1">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="mt-2 text-sm text-muted-foreground">Cargando mapa...</p>
              </div>
            </div>
          ) : (
            <MindMapCanvas mapId={mapId} />
          )}
        </div>
        {detailPanelOpen && <NodeDetailPanel mapId={mapId} />}
      </div>

      <CollaboratorDialog
        mapId={mapId}
        open={collaboratorDialogOpen}
        onOpenChange={setCollaboratorDialogOpen}
      />
    </div>
  );
}
