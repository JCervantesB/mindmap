"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, X } from "lucide-react";

interface NodeHeaderProps {
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onClose: () => void;
}

export function NodeHeader({ isEditing, onEdit, onCancelEdit, onClose }: NodeHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-2">
        {isEditing && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancelEdit}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <h3 className="font-medium">
          {isEditing ? "Editar nodo" : "Detalles del nodo"}
        </h3>
      </div>
      <div className="flex items-center gap-2">
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="gap-2"
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
