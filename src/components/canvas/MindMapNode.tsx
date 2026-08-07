"use client";

import { memo, useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { NodeResizer } from "@reactflow/node-resizer";
import "@reactflow/node-resizer/dist/style.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCanvasStore, CanvasNode } from "@/store/canvas";
import { cn } from "@/lib/utils";

const nodeTypeStyles: Record<string, string> = {
  root: "bg-primary text-primary-foreground border-primary",
  concept: "bg-card text-card-foreground border-border",
  subtopic: "bg-secondary text-secondary-foreground border-secondary",
  question: "bg-warning/10 text-warning-foreground border-warning",
  example: "bg-info/10 text-info-foreground border-info",
  source: "bg-muted text-muted-foreground border-muted-foreground/50",
};

const nodeTypeIcons: Record<string, string> = {
  root: "★",
  concept: "○",
  subtopic: "◕",
  question: "?",
  example: "□",
  source: "◎",
};

function MindMapNodeComponent({ data, selected }: NodeProps) {
  const { selectedNodeId } = useCanvasStore();
  const [isHovered, setIsHovered] = useState(false);

  const nodeData = data as CanvasNode["data"];
  const isSelected = selected || selectedNodeId === nodeData.id;

  const handleToggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    nodeData.onToggleCollapse?.(nodeData.id);
  };

  const hasChildren = nodeData.childCount && nodeData.childCount > 0;

  return (
    <div
      className={cn(
        "px-4 py-2 rounded-lg border-2 min-w-[150px] w-full h-full overflow-hidden",
        "hover:shadow-md",
        nodeTypeStyles[nodeData.nodeType] || nodeTypeStyles.concept,
        isSelected && "ring-2 ring-ring ring-offset-2 ring-offset-background"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <NodeResizer
        isVisible={isSelected}
        minWidth={150}
        minHeight={60}
        lineClassName="border-primary"
        handleClassName="bg-primary border-2 border-white"
        color="#64748b"
        onResizeEnd={(_, params) => {
          nodeData.onResize?.(nodeData.id, params.width, params.height);
        }}
      />

      <Handle
        type="target"
        position={Position.Left}
        className="bg-background cursor-pointer transition-all"
      />

      <div className="flex items-center gap-2">
        <span className="text-xs opacity-60">{nodeTypeIcons[nodeData.nodeType] || "○"}</span>
        <span className="font-medium text-sm truncate flex-1">{nodeData.title}</span>
        {hasChildren && (
          <button
            onClick={handleToggleCollapse}
            className={cn(
              "flex items-center justify-center w-6 h-6 rounded-full transition-all text-xs font-bold",
              "hover:bg-background/30",
              nodeData.isCollapsed ? "opacity-100" : "opacity-100",
              isHovered ? "bg-background/20" : "bg-background/10"
            )}
            title={nodeData.isCollapsed ? "Expandir" : "Colapsar"}
          >
            {nodeData.isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {nodeData.shortSummary && !nodeData.isCollapsed && (
        <p className="text-xs opacity-80 mt-1 line-clamp-2">{nodeData.shortSummary}</p>
      )}

      <div className="flex items-center gap-2 mt-2">
        {nodeData.isCollapsed && hasChildren && (
          <span className="text-[10px] bg-background/20 px-1 rounded flex items-center gap-1">
            <ChevronRight className="w-2 h-2" /> {nodeData.childCount}
          </span>
        )}
        {nodeData.generationMode === "generated" && (
          <span className="text-[10px] bg-background/20 px-1 rounded">AI</span>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="bg-background cursor-pointer transition-all"
      />
    </div>
  );
}

export const MindMapNode = memo(MindMapNodeComponent);
