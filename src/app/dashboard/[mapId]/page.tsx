"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { Brain, ArrowLeft, Maximize2, Loader2, Plus, Users, Pencil, Check, X, Undo2, Redo2, Download, FileText, Image as ImageIcon, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const { setNodes, setEdges, setViewport, setCollapsedNodes, toggleNodeCollapse, selectedNodeId, nodes, viewport, collapsedNodes, undo, redo } = useCanvasStore();
  const { setDetailPanelOpen, detailPanelOpen, addToast } = useUIStore();
  const [isCreatingNode, setIsCreatingNode] = useState(false);
  const [collaboratorDialogOpen, setCollaboratorDialogOpen] = useState(false);
  const [mapTitle, setMapTitle] = useState("Mapa");
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const lastSavedCollapsedRef = useRef<string[]>([]);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleNodeResize = useCallback((nodeId: string, width: number, height: number) => {
    const state = useCanvasStore.getState();
    const node = state.nodes.find((n) => n.id === nodeId);
    if (node) {
      state.updateNode(nodeId, {
        width,
        height,
        style: {
          ...node.style,
          width,
          height,
        },
        data: {
          ...node.data,
          nodeWidth: width,
          nodeHeight: height,
        },
      });
    }

    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
    resizeTimeoutRef.current = setTimeout(() => {
      fetch(`/api/nodes/${nodeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ width, height }),
      }).catch((error) => {
        console.error("Error guardando tamaño del nodo:", error);
      });
    }, 500);
  }, []);

  useEffect(() => {
    async function loadMap() {
      try {
        const viewportResponse = await fetch(`/api/maps/${mapId}/viewport`).catch(() => null);
        let savedCollapsedNodes: string[] = [];

        if (viewportResponse?.ok) {
          const viewportData = await viewportResponse.json();
          if (viewportData.viewportX !== undefined) {
            setViewport({
              x: viewportData.viewportX,
              y: viewportData.viewportY,
              zoom: viewportData.zoom,
            });
            if (viewportData.collapsedNodes && viewportData.collapsedNodes.length > 0) {
              savedCollapsedNodes = viewportData.collapsedNodes;
              setCollapsedNodes(savedCollapsedNodes);
            }
          }
        }

        const mapResponse = await fetch(`/api/maps/${mapId}`);

        if (mapResponse.ok) {
          const data = await mapResponse.json();
          setMapTitle(data.title || "Mapa");
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
              width?: number | string | null;
              height?: number | string | null;
            }) => {
              const nodeWidth = node.width != null ? Number(node.width) : 200;
              const nodeHeight = node.height != null ? Number(node.height) : 80;

              return {
                id: node.id,
                position: { x: node.posX, y: node.posY },
                type: "mindMapNode",
                width: nodeWidth,
                height: nodeHeight,
                style: {
                  width: nodeWidth,
                  height: nodeHeight,
                },
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
                  nodeWidth,
                  nodeHeight,
                  isCollapsed: savedCollapsedNodes.includes(node.id),
                  childCount: childCountMap.get(node.id) || 0,
                  parentNodeId: node.parentNodeId,
                  onToggleCollapse: toggleNodeCollapse,
                  onResize: handleNodeResize,
                },
              };
            });

            if (savedCollapsedNodes.length > 0) {
              const childIds = new Set<string>();
              const findChildren = (parentId: string) => {
                data.edges?.forEach((edge: { sourceNodeId: string; targetNodeId: string }) => {
                  if (edge.sourceNodeId === parentId && !childIds.has(edge.targetNodeId)) {
                    childIds.add(edge.targetNodeId);
                    findChildren(edge.targetNodeId);
                  }
                });
              };
              savedCollapsedNodes.forEach((nodeId) => findChildren(nodeId));

              canvasNodes = canvasNodes.map((n) => ({
                ...n,
                hidden: childIds.has(n.id) || savedCollapsedNodes.includes(n.id),
              }));
            }
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

            if (savedCollapsedNodes.length > 0) {
              const childIds = new Set<string>();
              const findChildren = (parentId: string) => {
                data.edges?.forEach((edge: { sourceNodeId: string; targetNodeId: string }) => {
                  if (edge.sourceNodeId === parentId && !childIds.has(edge.targetNodeId)) {
                    childIds.add(edge.targetNodeId);
                    findChildren(edge.targetNodeId);
                  }
                });
              };
              savedCollapsedNodes.forEach((nodeId) => findChildren(nodeId));

              canvasEdges.forEach((e) => {
                if (childIds.has(e.source) || childIds.has(e.target) || savedCollapsedNodes.includes(e.source)) {
                  e.hidden = true;
                }
              });
            }

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
      } catch (error) {
        console.error("Failed to load map:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (mapId) {
      loadMap();
    }
  }, [mapId, setNodes, setEdges, setViewport, setCollapsedNodes]);

  useEffect(() => {
    if (selectedNodeId) {
      setDetailPanelOpen(true);
    }
  }, [selectedNodeId, setDetailPanelOpen]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const state = useCanvasStore.getState();
      navigator.sendBeacon(`/api/maps/${mapId}/viewport`, JSON.stringify({
        viewportX: state.viewport.x,
        viewportY: state.viewport.y,
        zoom: state.viewport.zoom,
        collapsedNodes: state.collapsedNodes,
      }));
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [mapId]);

  useEffect(() => {
    if (JSON.stringify(collapsedNodes) !== JSON.stringify(lastSavedCollapsedRef.current)) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        const state = useCanvasStore.getState();
        lastSavedCollapsedRef.current = state.collapsedNodes;
        fetch(`/api/maps/${mapId}/viewport`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            viewportX: state.viewport.x,
            viewportY: state.viewport.y,
            zoom: state.viewport.zoom,
            collapsedNodes: state.collapsedNodes,
          }),
        }).catch((err) => console.error("Error saving viewport:", err));
      }, 500);
    }
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [mapId, collapsedNodes]);

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
        width: 200,
        height: 80,
        style: { width: 200, height: 80 },
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
          nodeWidth: 200,
          nodeHeight: 80,
          isCollapsed: newNode.isCollapsed,
          childCount: 0,
          parentNodeId: newNode.parentNodeId,
          onToggleCollapse: toggleNodeCollapse,
          onResize: handleNodeResize,
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

  const handleRename = async () => {
    const title = renameValue.trim();
    if (!title || title === mapTitle) {
      setIsRenaming(false);
      return;
    }
    try {
      const response = await fetch(`/api/maps/${mapId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (response.ok) {
        setMapTitle(title);
        addToast({ type: "success", message: "Mapa renombrado" });
      } else {
        addToast({ type: "error", message: "No se pudo renombrar el mapa" });
      }
    } catch (error) {
      console.error("Error renombrando mapa:", error);
      addToast({ type: "error", message: "Error al renombrar el mapa" });
    } finally {
      setIsRenaming(false);
    }
  };

  const handleToggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  const handleExport = async (format: "png" | "markdown" | "json") => {
    try {
      if (format === "png") {
        const element = document.querySelector(".react-flow") as HTMLElement | null;
        if (!element) return;
        const { toPng } = await import("html-to-image");
        const dataUrl = await toPng(element, {
          backgroundColor: "#ffffff",
          pixelRatio: 2,
        });
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `${mapTitle || "mapa"}.png`;
        link.click();
        return;
      }
      const link = document.createElement("a");
      link.href = `/api/maps/${mapId}/export?format=${format}`;
      link.download = "";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exportando:", error);
      addToast({ type: "error", message: "Error al exportar el mapa" });
    }
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex min-h-14 flex-wrap items-center justify-between gap-2 border-b bg-card px-4 py-2">
        <div className="flex items-center gap-4">
          <a href="/dashboard">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </a>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            {isRenaming ? (
              <div className="flex items-center gap-1">
                <Input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename();
                    if (e.key === "Escape") setIsRenaming(false);
                  }}
                  className="h-8 w-56"
                />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRename}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsRenaming(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-medium line-clamp-1">{mapTitle}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  title="Renombrar mapa"
                  onClick={() => {
                    setRenameValue(mapTitle);
                    setIsRenaming(true);
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" title="Deshacer (Ctrl+Z)" onClick={() => undo()}>
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" title="Rehacer (Ctrl+Shift+Z)" onClick={() => redo()}>
            <Redo2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleCreateNode} disabled={isCreatingNode}>
            <Plus className="h-4 w-4" />
            Nuevo nodo
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setCollaboratorDialogOpen(true)}>
            <Users className="h-4 w-4" />
            Compartir
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("png")}>
                <ImageIcon className="mr-2 h-4 w-4" />
                Imagen PNG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("markdown")}>
                <FileText className="mr-2 h-4 w-4" />
                Markdown
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("json")}>
                <FileJson className="mr-2 h-4 w-4" />
                JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleToggleFullscreen}>
            <Maximize2 className="h-4 w-4" />
            Pantalla completa
          </Button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0 bg-muted/30">
        <div className="flex-1 min-w-0">
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
