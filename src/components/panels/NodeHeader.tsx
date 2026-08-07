"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, X, Plus, Loader2 } from "lucide-react";

interface NodeHeaderProps {
  isEditing: boolean;
  isCreatingChild: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onClose: () => void;
  onCreateChild: () => void;
}

export function NodeHeader({
  isEditing,
  isCreatingChild,
  onEdit,
  onCancelEdit,
  onClose,
  onCreateChild,
}: NodeHeaderProps) {
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
        <Button
          variant="outline"
          size="sm"
          onClick={onCreateChild}
          disabled={isCreatingChild}
          className="gap-2"
        >
          {isCreatingChild ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Crear hijo
        </Button>
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
