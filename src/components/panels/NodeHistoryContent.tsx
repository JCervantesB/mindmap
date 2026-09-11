"use client";

import { useEffect, useState, useCallback } from "react";
import { History, RotateCcw, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Revision {
  id: string;
  versionNumber: number;
  title: string;
  shortSummary: string | null;
  contentMarkdown: string | null;
  editorialStatus: string;
  createdAt: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

interface NodeHistoryContentProps {
  mapId: string;
  nodeId: string;
}

export function NodeHistoryContent({ mapId, nodeId }: NodeHistoryContentProps) {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const fetchRevisions = useCallback(async () => {
    try {
      const response = await fetch(`/api/maps/${mapId}/nodes/${nodeId}/revisions`);
      if (response.ok) {
        const data = await response.json();
        setRevisions(data);
      }
    } catch (error) {
      console.error("Error obteniendo revisiones:", error);
    } finally {
      setIsLoading(false);
    }
  }, [mapId, nodeId]);

  useEffect(() => {
    setIsLoading(true);
    fetchRevisions();
  }, [fetchRevisions]);

  const handleRestore = async (revision: Revision) => {
    if (!confirm(`¿Restaurar la versión ${revision.versionNumber}?`)) return;
    setRestoringId(revision.id);
    try {
      const response = await fetch(`/api/maps/${mapId}/nodes/${nodeId}/revisions/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revisionId: revision.id }),
      });
      if (response.ok) {
        toast.success(`Versión ${revision.versionNumber} restaurada`);
        fetchRevisions();
      } else {
        toast.error("No se pudo restaurar la versión");
      }
    } catch (error) {
      console.error("Error restaurando revisión:", error);
      toast.error("Error al restaurar la versión");
    } finally {
      setRestoringId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (revisions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <History className="h-8 w-8 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">Sin historial</p>
        <p className="mt-1 max-w-[220px] text-xs text-muted-foreground">
          Las versiones del contenido aparecerán aquí cuando edites o generes el nodo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Historial de versiones</p>
      {revisions.map((revision) => (
        <div
          key={revision.id}
          className="rounded-lg border bg-card p-3"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                v{revision.versionNumber}
              </Badge>
              <span className="text-sm font-medium line-clamp-1">{revision.title}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5"
              onClick={() => handleRestore(revision)}
              disabled={restoringId === revision.id}
            >
              {restoringId === revision.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RotateCcw className="h-3.5 w-3.5" />
              )}
              Restaurar
            </Button>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatDate(revision.createdAt)}
          </div>
          {revision.shortSummary && (
            <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
              {revision.shortSummary}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}