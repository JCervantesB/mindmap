"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { useUIStore } from "@/store/ui";
import { useNodeDetail } from "./useNodeDetail";
import { NodeHeader } from "./NodeHeader";
import { NodeViewContent } from "./NodeViewContent";
import { NodeEditContent } from "./NodeEditContent";
import { NodeActions } from "./NodeActions";
import { NodeHistoryContent } from "./NodeHistoryContent";
import { NodeSourcesContent } from "./NodeSourcesContent";
import { NodeCommentsContent } from "./NodeCommentsContent";
import { FileText, History, Link2, MessageSquare } from "lucide-react";

interface NodeDetailPanelProps {
  mapId: string;
}

export function NodeDetailPanel({ mapId }: NodeDetailPanelProps) {
  const {
    detailPanelOpen,
    setDetailPanelOpen,
    detailPanelWidth,
    setDetailPanelWidth,
    detailPanelTab,
    setDetailPanelTab,
  } = useUIStore();

  const {
    selectedNode,
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
  } = useNodeDetail({ mapId });

  const handleClose = () => {
    setDetailPanelOpen(false);
  };

  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !panelRef.current) return;
      const container = panelRef.current.parentElement;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const newWidth = containerRect.right - e.clientX;
      const clampedWidth = Math.min(Math.max(newWidth, 280), 1200);
      setDetailPanelWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, setDetailPanelWidth]);

  if (!detailPanelOpen || !selectedNode) {
    return null;
  }

  return (
    <div
      ref={panelRef}
      className="relative border-l bg-card flex flex-col h-full shrink-0 max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:h-[60vh] max-md:w-full! max-md:border-t max-md:border-l-0 max-md:z-50"
      style={{ width: detailPanelWidth }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-primary/40 active:bg-primary/50 transition-colors bg-muted"
        onMouseDown={handleMouseDown}
        onClick={(e) => e.stopPropagation()}
      />

      <NodeHeader
        isEditing={isEditing}
        isCreatingChild={isCreatingChild}
        onEdit={() => setIsEditing(true)}
        onCancelEdit={handleCancelEdit}
        onClose={handleClose}
        onCreateChild={handleCreateChildNode}
      />

      <div className="flex-1 overflow-y-auto p-4">
        {isEditing ? (
          <NodeEditContent
            nodeId={selectedNode.id}
            title={localTitle}
            shortSummary={localShortSummary}
            contentMarkdown={localContentMarkdown}
            nodeType={localNodeType}
            editorialStatus={localEditorialStatus}
            isSaving={isSaving}
            isDirty={isDirty}
            lastSavedAt={lastSavedAt}
            onTitleChange={handleTitleChange}
            onSummaryChange={handleSummaryChange}
            onContentChange={handleContentChange}
            onNodeTypeChange={handleNodeTypeChange}
            onEditorialStatusChange={handleEditorialStatusChange}
          />
        ) : (
          <>
            <div className="mb-4 flex items-center gap-1 rounded-lg bg-muted p-1">
              <TabButton
                active={detailPanelTab === "content"}
                onClick={() => setDetailPanelTab("content")}
                icon={<FileText className="h-3.5 w-3.5" />}
                label="Contenido"
              />
              <TabButton
                active={detailPanelTab === "history"}
                onClick={() => setDetailPanelTab("history")}
                icon={<History className="h-3.5 w-3.5" />}
                label="Historial"
              />
              <TabButton
                active={detailPanelTab === "sources"}
                onClick={() => setDetailPanelTab("sources")}
                icon={<Link2 className="h-3.5 w-3.5" />}
                label="Fuentes"
              />
              <TabButton
                active={detailPanelTab === "comments"}
                onClick={() => setDetailPanelTab("comments")}
                icon={<MessageSquare className="h-3.5 w-3.5" />}
                label="Comentarios"
              />
            </div>
            {detailPanelTab === "history" ? (
              <NodeHistoryContent mapId={mapId} nodeId={selectedNode.id} />
            ) : detailPanelTab === "sources" ? (
              <NodeSourcesContent mapId={mapId} nodeId={selectedNode.id} />
            ) : detailPanelTab === "comments" ? (
              <NodeCommentsContent mapId={mapId} nodeId={selectedNode.id} />
            ) : (
              <NodeViewContent node={selectedNode} />
            )}
          </>
        )}
      </div>

      <NodeActions
        isEditing={isEditing}
        isSaving={isSaving}
        isDirty={isDirty}
        isCreatingChild={isCreatingChild}
        isGenerating={isGenerating}
        isDeleting={isDeleting}
        generationProgress={generationProgress}
        onGenerate={handleGenerate}
        onCreateChild={handleCreateChildNode}
        onSave={handleSave}
        onCancelEdit={handleCancelEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-7 flex-1 items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-colors ${
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
