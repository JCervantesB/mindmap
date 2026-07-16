"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const nodeTypes = [
  { value: "root", label: "Raíz" },
  { value: "concept", label: "Concepto" },
  { value: "subtopic", label: "Subtema" },
  { value: "question", label: "Pregunta" },
  { value: "example", label: "Ejemplo" },
  { value: "source", label: "Fuente" },
];

const editorialStatuses = [
  { value: "draft", label: "Borrador" },
  { value: "review", label: "En revisión" },
  { value: "published", label: "Publicado" },
  { value: "archived", label: "Archivado" },
];

interface NodeEditContentProps {
  title: string;
  shortSummary: string;
  contentMarkdown: string;
  nodeType: string;
  editorialStatus: string;
  isSaving: boolean;
  isDirty: boolean;
  lastSavedAt: Date | null;
  onTitleChange: (value: string) => void;
  onSummaryChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onNodeTypeChange: (value: string) => void;
  onEditorialStatusChange: (value: string) => void;
}

export function NodeEditContent({
  title,
  shortSummary,
  contentMarkdown,
  nodeType,
  editorialStatus,
  isSaving,
  isDirty,
  lastSavedAt,
  onTitleChange,
  onSummaryChange,
  onContentChange,
  onNodeTypeChange,
  onEditorialStatusChange,
}: NodeEditContentProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Título</label>
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Título del nodo"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Tipo</label>
        <Select value={nodeType} onValueChange={(v) => onNodeTypeChange(v || "")}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {nodeTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Estado editorial</label>
        <Select value={editorialStatus} onValueChange={(v) => onEditorialStatusChange(v || "")}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {editorialStatuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Resumen corto</label>
        <Textarea
          value={shortSummary}
          onChange={(e) => onSummaryChange(e.target.value)}
          placeholder="Breve descripción del nodo"
          rows={2}
          className="resize-none"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Contenido</label>
          {isDirty && (
            <Badge variant="outline" className="text-xs">
              {isSaving ? "Guardando..." : "Sin guardar"}
            </Badge>
          )}
          {!isDirty && lastSavedAt && (
            <span className="text-xs text-muted-foreground">
              Guardado {lastSavedAt.toLocaleTimeString()}
            </span>
          )}
        </div>
        <Textarea
          value={contentMarkdown}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="Contenido en Markdown..."
          rows={10}
          className="resize-none font-mono text-sm"
        />
      </div>
    </div>
  );
}
