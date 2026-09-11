"use client";

import { useEffect, useState, useCallback } from "react";
import { Link2, Loader2, ExternalLink } from "lucide-react";

interface Source {
  id: string;
  title: string;
  url: string;
  snippet: string | null;
  relevanceScore: number | null;
  createdAt: string;
}

interface NodeSourcesContentProps {
  mapId: string;
  nodeId: string;
}

export function NodeSourcesContent({ mapId, nodeId }: NodeSourcesContentProps) {
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSources = useCallback(async () => {
    try {
      const response = await fetch(`/api/maps/${mapId}/nodes/${nodeId}/sources`);
      if (response.ok) {
        const data = await response.json();
        setSources(data);
      }
    } catch (error) {
      console.error("Error obteniendo fuentes:", error);
    } finally {
      setIsLoading(false);
    }
  }, [mapId, nodeId]);

  useEffect(() => {
    setIsLoading(true);
    fetchSources();
  }, [fetchSources]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (sources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Link2 className="h-8 w-8 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">Sin fuentes registradas</p>
        <p className="mt-1 max-w-[220px] text-xs text-muted-foreground">
          Las fuentes utilizadas para generar este contenido aparecerán aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Fuentes de investigación</p>
      {sources.map((source) => (
        <a
          key={source.id}
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50"
        >
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm font-medium line-clamp-2">{source.title}</span>
            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </div>
          {source.snippet && (
            <p className="mt-1.5 text-xs text-muted-foreground line-clamp-3">
              {source.snippet}
            </p>
          )}
          {source.relevanceScore != null && (
            <p className="mt-1.5 text-xs text-muted-foreground">
              Relevancia: {Math.round(source.relevanceScore * 100)}%
            </p>
          )}
        </a>
      ))}
    </div>
  );
}