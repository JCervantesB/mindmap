"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Plus, Sparkles, Save, Trash2, ArrowLeft } from "lucide-react";

interface NodeActionsProps {
  isEditing: boolean;
  isSaving: boolean;
  isDirty: boolean;
  isCreatingChild: boolean;
  isGenerating: boolean;
  isDeleting: boolean;
  generationProgress: string;
  onGenerate: () => void;
  onCreateChild: () => void;
  onSave: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
}

export function NodeActions({
  isEditing,
  isSaving,
  isDirty,
  isCreatingChild,
  isGenerating,
  isDeleting,
  generationProgress,
  onGenerate,
  onCreateChild,
  onSave,
  onCancelEdit,
  onDelete,
}: NodeActionsProps) {
  return (
    <div className="p-4 border-t space-y-2">
      <Button
        onClick={onGenerate}
        disabled={isGenerating}
        className="w-full gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {generationProgress || "Generando..."}
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generar contenido con IA
          </>
        )}
      </Button>

      <Button
        onClick={onCreateChild}
        disabled={isCreatingChild}
        className="w-full gap-2"
      >
        {isCreatingChild ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        Crear nodo hijo
      </Button>

      {isEditing && (
        <>
          <Button
            onClick={onSave}
            disabled={isSaving || !isDirty}
            className="w-full gap-2"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? "Guardando..." : isDirty ? "Guardar cambios" : "Guardado"}
          </Button>

          <Button
            variant="outline"
            onClick={onCancelEdit}
            className="w-full gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Cancelar
          </Button>
        </>
      )}

      <Button
        variant="destructive"
        onClick={onDelete}
        disabled={isDeleting}
        className="w-full gap-2"
      >
        {isDeleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
        Eliminar nodo
      </Button>
    </div>
  );
}
