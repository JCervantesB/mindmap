"use client";

import { memo } from "react";
import { EdgeProps, getBezierPath } from "reactflow";
import { cn } from "@/lib/utils";

const relationTypeStyles: Record<string, { color: string; strokeDasharray?: string }> = {
  structural: { color: "stroke-primary" },
  related: { color: "stroke-secondary" },
  causal: { color: "stroke-destructive" },
  comparative: { color: "stroke-warning" },
  prerequisite: { color: "stroke-info" },
};

function MindMapEdgeComponent({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const style = relationTypeStyles[data?.relationType || "structural"] || relationTypeStyles.structural;

  return (
    <>
      <path
        className={cn(
          "fill-none stroke-2",
          style.color,
          style.strokeDasharray && "stroke-dasharray-4",
          selected && "stroke-3"
        )}
        d={edgePath}
      />
      {data?.label && (
        <foreignObject
          x={labelX - 50}
          y={labelY - 10}
          width={100}
          height={20}
          className="overflow-visible"
        >
          <div className="flex items-center justify-center">
            <span className="text-xs bg-background px-1 py-0.5 rounded border">
              {data.label}
            </span>
          </div>
        </foreignObject>
      )}
    </>
  );
}

export const MindMapEdge = memo(MindMapEdgeComponent);
