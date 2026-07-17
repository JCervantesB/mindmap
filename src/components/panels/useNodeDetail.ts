import { useState, useCallback, useRef, useEffect } from "react";
import { useCanvasStore, CanvasNode } from "@/store/canvas";
import { useDraftStore } from "@/store/drafts";
import { useUIStore } from "@/store/ui";

interface UseNodeDetailOptions {
  mapId: string;
}

export function useNodeDetail({ mapId }: UseNodeDetailOptions) {
  const { nodes, setNodes, toggleNodeCollapse } = useCanvasStore();
  const { getDraft, updateDraft, setDraft, markSaved, drafts } = useDraftStore();
  const { addToast } = useUIStore();

  const selectedNode = nodes.find((n) => n.id === useCanvasStore.getState().selectedNodeId);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreatingChild, setIsCreatingChild] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const [localTitle, setLocalTitle] = useState("");
  const [localShortSummary, setLocalShortSummary] = useState("");
  const [localContentMarkdown, setLocalContentMarkdown] = useState("");
  const [localNodeType, setLocalNodeType] = useState("");
  const [localEditorialStatus, setLocalEditorialStatus] = useState("");

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const selectedNodeId = useCanvasStore.getState().selectedNodeId;
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;

  useEffect(() => {
    if (selectedNode) {
      const existingDraft = getDraft(selectedNode.id);
      if (existingDraft) {
        setLocalTitle(existingDraft.title);
        setLocalShortSummary(existingDraft.shortSummary);
        setLocalContentMarkdown(existingDraft.contentMarkdown);
        setIsDirty(existingDraft.isDirty);
        setLastSavedAt(existingDraft.lastSavedAt);
      } else {
        setLocalTitle(selectedNode.data.title);
        setLocalShortSummary(selectedNode.data.shortSummary || "");
        setLocalContentMarkdown(selectedNode.data.contentMarkdown || "");
        setIsDirty(false);
        setLastSavedAt(null);
      }
      setLocalNodeType(selectedNode.data.nodeType);
      setLocalEditorialStatus(selectedNode.data.editorialStatus);
    }
  }, [selectedNode, getDraft]);

  const triggerAutosave = useCallback(() => {
    if (!selectedNode || isSaving) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        const response = await fetch(`/api/maps/${mapId}/nodes/${selectedNode.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: localTitle,
            shortSummary: localShortSummary || null,
            contentMarkdown: localContentMarkdown || null,
            nodeType: localNodeType,
            editorialStatus: localEditorialStatus,
          }),
        });

        if (!response.ok) throw new Error("Error guardando nodo");

        const updatedNode = await response.json();

        setNodes(
          nodesRef.current.map((n) =>
            n.id === selectedNode.id
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    title: updatedNode.title,
                    shortSummary: updatedNode.shortSummary,
                    contentMarkdown: updatedNode.contentMarkdown,
                    nodeType: updatedNode.nodeType,
                    editorialStatus: updatedNode.editorialStatus,
                  },
                }
              : n
          )
        );

        markSaved(selectedNode.id);
        setIsDirty(false);
        setLastSavedAt(new Date());
      } catch (error) {
        console.error("Error guardando nodo:", error);
      } finally {
        setIsSaving(false);
      }
    }, 15000);
    }, [selectedNode, isSaving, localTitle, localShortSummary, localContentMarkdown, localNodeType, localEditorialStatus, mapId, setNodes, markSaved]);

  const handleSave = useCallback(async () => {
    if (!selectedNode || isSaving) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/maps/${mapId}/nodes/${selectedNode.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: localTitle,
          shortSummary: localShortSummary || null,
          contentMarkdown: localContentMarkdown || null,
          nodeType: localNodeType,
          editorialStatus: localEditorialStatus,
        }),
      });

      if (!response.ok) throw new Error("Error guardando nodo");

      const updatedNode = await response.json();

      setNodes(
        nodesRef.current.map((n) =>
          n.id === selectedNode.id
            ? {
                ...n,
                data: {
                  ...n.data,
                  title: updatedNode.title,
                  shortSummary: updatedNode.shortSummary,
                  contentMarkdown: updatedNode.contentMarkdown,
                  nodeType: updatedNode.nodeType,
                  editorialStatus: updatedNode.editorialStatus,
                },
              }
            : n
        )
      );

      markSaved(selectedNode.id);
      setIsDirty(false);
      setLastSavedAt(new Date());
      addToast({ type: "success", message: "Nodo guardado" });
    } catch (error) {
      console.error("Error guardando nodo:", error);
      addToast({ type: "error", message: "Error al guardar el nodo" });
    } finally {
      setIsSaving(false);
    }
  }, [selectedNode, isSaving, localTitle, localShortSummary, localContentMarkdown, localNodeType, localEditorialStatus, mapId, setNodes, markSaved, addToast]);

  const handleDelete = useCallback(async () => {
    if (!selectedNode) return;
    if (!confirm("¿Estás seguro de eliminar este nodo y todos sus descendientes?")) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/maps/${mapId}/nodes/${selectedNode.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error eliminando nodo");

      const { nodes: storeNodes, edges: storeEdges, setNodes: setStoreNodes, setEdges: setStoreEdges } = useCanvasStore.getState();

      const nodesToDelete = new Set<string>();
      const findDescendants = (nodeId: string) => {
        nodesToDelete.add(nodeId);
        storeNodes.forEach((n) => {
          if (n.data.parentNodeId === nodeId) {
            findDescendants(n.id);
          }
        });
      };
      findDescendants(selectedNode.id);

      const remainingNodes = storeNodes.filter((n) => !nodesToDelete.has(n.id));
      const remainingEdges = storeEdges.filter(
        (e) => !nodesToDelete.has(e.source) && !nodesToDelete.has(e.target)
      );

      setStoreNodes(remainingNodes);
      setStoreEdges(remainingEdges);
      useCanvasStore.getState().setSelectedNodeId(null);
      addToast({ type: "success", message: "Nodo eliminado" });
    } catch (error) {
      console.error("Error eliminando nodo:", error);
      addToast({ type: "error", message: "Error al eliminar el nodo" });
    } finally {
      setIsDeleting(false);
    }
  }, [selectedNode, mapId, addToast]);

  const handleCreateChildNode = useCallback(async () => {
    if (!selectedNode) return;

    setIsCreatingChild(true);
    try {
      const siblingCount = nodes.filter(
        (n) => n.data.parentNodeId === selectedNode.id
      ).length;

      const response = await fetch(`/api/maps/${mapId}/nodes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentNodeId: selectedNode.id,
          title: "Nuevo subtema",
          nodeType: "subtopic",
          position: siblingCount,
          posX: selectedNode.position.x + 250,
          posY: selectedNode.position.y + siblingCount * 100,
        }),
      });

      if (!response.ok) throw new Error("Error creando nodo hijo");

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
      addToast({ type: "success", message: "Nodo hijo creado" });
    } catch (error) {
      console.error("Error creando nodo hijo:", error);
      addToast({ type: "error", message: "Error al crear el nodo hijo" });
    } finally {
      setIsCreatingChild(false);
    }
  }, [selectedNode, nodes, mapId, setNodes, toggleNodeCollapse, addToast]);

  const handleGenerate = useCallback(async () => {
    if (!selectedNode) return;

    setIsGenerating(true);
    setGenerationProgress("Investigando...");
    setLocalContentMarkdown("");
    try {
      const response = await fetch(`/api/maps/${mapId}/nodes/${selectedNode.id}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error generando contenido");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No se pudo leer la respuesta");

      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.stage === "research") {
                setGenerationProgress("Investigando...");
              } else if (data.stage === "qa") {
                setGenerationProgress("Evaluando...");
              } else if (data.stage === "editor") {
                setGenerationProgress("Generando contenido...");
              } else if (data.type === "text-delta") {
                fullContent += data.content;
                setLocalContentMarkdown(fullContent);
              } else if (data.type === "done") {
                setLocalTitle(data.title);
                setLocalShortSummary(data.shortSummary || "");

                setNodes(
                  nodesRef.current.map((n) =>
                    n.id === selectedNode.id
                      ? {
                          ...n,
                          data: {
                            ...n.data,
                            title: data.title,
                            shortSummary: data.shortSummary,
                            contentMarkdown: data.contentMarkdown,
                            editorialStatus: "review",
                          },
                        }
                      : n
                  )
                );

                setIsDirty(false);
                setLastSavedAt(new Date());
                addToast({ type: "success", message: "Contenido generado exitosamente" });
              } else if (data.type === "error") {
                throw new Error(data.error);
              }
            } catch (e) {
              console.warn("Error parsing SSE:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error generando contenido:", error);
      addToast({
        type: "error",
        message: error instanceof Error ? error.message : "Error al generar contenido",
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress("");
    }
  }, [selectedNode, mapId, setNodes, addToast]);

  const handleCancelEdit = useCallback(() => {
    if (selectedNode) {
      setLocalTitle(selectedNode.data.title);
      setLocalShortSummary(selectedNode.data.shortSummary || "");
      setLocalContentMarkdown(selectedNode.data.contentMarkdown || "");
      setLocalNodeType(selectedNode.data.nodeType);
      setLocalEditorialStatus(selectedNode.data.editorialStatus);
      setIsDirty(false);
      setIsEditing(false);
    }
  }, [selectedNode]);

  const handleTitleChange = useCallback((value: string) => {
    setLocalTitle(value);
    setIsDirty(true);
    if (selectedNodeId) {
      const existingDraft = getDraft(selectedNodeId);
      if (existingDraft) {
        updateDraft(selectedNodeId, { title: value });
      } else {
        setDraft(selectedNodeId, {
          title: value,
          shortSummary: localShortSummary,
          contentMarkdown: localContentMarkdown,
          isDirty: true,
          lastSavedAt: null,
        });
      }
    }
    triggerAutosave();
  }, [selectedNodeId, getDraft, updateDraft, setDraft, localShortSummary, localContentMarkdown, triggerAutosave]);

  const handleSummaryChange = useCallback((value: string) => {
    setLocalShortSummary(value);
    setIsDirty(true);
    if (selectedNodeId) {
      const existingDraft = getDraft(selectedNodeId);
      if (existingDraft) {
        updateDraft(selectedNodeId, { shortSummary: value });
      } else {
        setDraft(selectedNodeId, {
          title: localTitle,
          shortSummary: value,
          contentMarkdown: localContentMarkdown,
          isDirty: true,
          lastSavedAt: null,
        });
      }
    }
    triggerAutosave();
  }, [selectedNodeId, getDraft, updateDraft, setDraft, localTitle, localContentMarkdown, triggerAutosave]);

  const handleContentChange = useCallback((value: string) => {
    setLocalContentMarkdown(value);
    setIsDirty(true);
    if (selectedNodeId) {
      const existingDraft = getDraft(selectedNodeId);
      if (existingDraft) {
        updateDraft(selectedNodeId, { contentMarkdown: value });
      } else {
        setDraft(selectedNodeId, {
          title: localTitle,
          shortSummary: localShortSummary,
          contentMarkdown: value,
          isDirty: true,
          lastSavedAt: null,
        });
      }
    }
    triggerAutosave();
  }, [selectedNodeId, getDraft, updateDraft, setDraft, localTitle, localShortSummary, triggerAutosave]);

  const handleNodeTypeChange = useCallback((value: string) => {
    setLocalNodeType(value);
    setIsDirty(true);
    triggerAutosave();
  }, [triggerAutosave]);

  const handleEditorialStatusChange = useCallback((value: string) => {
    setLocalEditorialStatus(value);
    setIsDirty(true);
    triggerAutosave();
  }, [triggerAutosave]);

  return {
    selectedNode,
    selectedNodeId,
    isEditing,
    setIsEditing,
    isSaving,
    isDeleting,
    isCreatingChild,
    isGenerating,
    generationProgress,
    isDirty,
    lastSavedAt,
    localTitle,
    localShortSummary,
    localContentMarkdown,
    localNodeType,
    localEditorialStatus,
    handleSave,
    handleDelete,
    handleCreateChildNode,
    handleGenerate,
    handleCancelEdit,
    handleTitleChange,
    handleSummaryChange,
    handleContentChange,
    handleNodeTypeChange,
    handleEditorialStatusChange,
  };
}
