"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { useUIStore } from "@/store/ui";
import { useNodeDetail } from "./useNodeDetail";
import { NodeHeader } from "./NodeHeader";
import { NodeViewContent } from "./NodeViewContent";
import { NodeEditContent } from "./NodeEditContent";
import { NodeActions } from "./NodeActions";

interface NodeDetailPanelProps {
  mapId: string;
}

export function NodeDetailPanel({ mapId }: NodeDetailPanelProps) {
  const { detailPanelOpen, setDetailPanelOpen, detailPanelWidth, setDetailPanelWidth } = useUIStore();

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
      className="relative border-l bg-card flex flex-col h-full shrink-0"
      style={{ width: detailPanelWidth }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-primary/40 active:bg-primary/50 transition-colors bg-muted"
        onMouseDown={handleMouseDown}
        onClick={(e) => e.stopPropagation()}
      />

      <NodeHeader
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onCancelEdit={handleCancelEdit}
        onClose={handleClose}
      />

      <div className="flex-1 overflow-y-auto p-4">
        {isEditing ? (
          <NodeEditContent
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
          <NodeViewContent node={selectedNode} />
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
