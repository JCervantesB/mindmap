"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Brain, Loader2, AlertCircle, X, UserPlus, Check } from "lucide-react";
import { MindMapCanvas } from "@/components/canvas/MindMapCanvas";
import { useCanvasStore, CanvasNode, CanvasEdge } from "@/store/canvas";
import { getLayoutedElements } from "@/lib/layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function SharePage() {
  const params = useParams();
  const token = params.token as string;
  const { isSignedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapTitle, setMapTitle] = useState("");
  const [selectedNode, setSelectedNode] = useState<CanvasNode | null>(null);
  const [requestStatus, setRequestStatus] = useState<"none" | "pending" | "requested">("none");
  const [requesting, setRequesting] = useState(false);
  const { setNodes, setEdges, setViewport, selectedNodeId, setSelectedNodeId } = useCanvasStore();

  useEffect(() => {
    async function loadSharedMap() {
      try {
        const response = await fetch(`/api/share/${token}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError("Este link de compartición no existe o ha sido revocado.");
          } else {
            setError("Error al cargar el mapa compartido.");
          }
          return;
        }

        const data = await response.json();
        setMapTitle(data.title || "Mapa compartido");

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

        if (data.viewport) {
          setViewport({
            x: data.viewport.viewportX || 0,
            y: data.viewport.viewportY || 0,
            zoom: data.viewport.zoom || 1,
          });
        }
      } catch (err) {
        console.error("Error loading shared map:", err);
        setError("Error al cargar el mapa compartido.");
      } finally {
        setIsLoading(false);
      }
    }

    if (token) {
      loadSharedMap();
    }
  }, [token, setNodes, setEdges, setViewport]);

  useEffect(() => {
    if (selectedNodeId) {
      const node = useCanvasStore.getState().nodes.find((n) => n.id === selectedNodeId);
      setSelectedNode(node || null);
    } else {
      setSelectedNode(null);
    }
  }, [selectedNodeId]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/30">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-2 text-sm text-muted-foreground">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/30">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="mt-4 text-lg font-semibold">No disponible</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  const handleRequestCollaboration = async () => {
    if (!isSignedIn) return;

    setRequesting(true);
    try {
      const response = await fetch(`/api/share/${token}/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        setRequestStatus("requested");
      }
    } catch (error) {
      console.error("Error requesting collaboration:", error);
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-muted/30">
      <header className="flex h-14 items-center gap-2 border-b bg-card px-4">
        <Brain className="h-5 w-5 text-primary" />
        <span className="font-medium">{mapTitle}</span>
        <span className="ml-auto flex items-center gap-2">
          {requestStatus === "requested" ? (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <Check className="h-4 w-4" />
              Solicitud enviada
            </span>
          ) : isSignedIn ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRequestCollaboration}
              disabled={requesting}
              className="gap-1"
            >
              <UserPlus className="h-4 w-4" />
              {requesting ? "Enviando..." : "Solicitar colaborar"}
            </Button>
          ) : null}
          <span className="text-xs text-muted-foreground">
            Solo lectura
          </span>
        </span>
      </header>
      <div className="flex-1 flex">
        <div className="flex-1">
          <MindMapCanvas mapId="" />
        </div>
        {selectedNode && (
          <div className="w-96 border-l bg-card flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold">{selectedNode.data.title}</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedNodeId(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {selectedNode.data.shortSummary && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {selectedNode.data.shortSummary}
                    </p>
                  </div>
                )}
                {selectedNode.data.contentMarkdown && (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {selectedNode.data.contentMarkdown}
                    </ReactMarkdown>
                  </div>
                )}
                {!selectedNode.data.shortSummary && !selectedNode.data.contentMarkdown && (
                  <p className="text-sm text-muted-foreground italic">
                    Este nodo aún no tiene contenido.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
