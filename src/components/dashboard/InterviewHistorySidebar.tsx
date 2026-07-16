"use client";

import { useState, useEffect } from "react";
import {
  ChevronDown,
  MessageSquare,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Session {
  id: string;
  topic: string | null;
  status: string;
  intentSummary: string | null;
  updatedAt: string;
  mapId: string | null;
}

interface InterviewHistorySidebarProps {
  onNewInterview: () => void;
  onResumeSession: (sessionId: string) => void;
}

const statusConfig: Record<string, { icon: typeof CheckCircle; label: string; color: string }> = {
  draft: { icon: Clock, label: "En progreso", color: "text-yellow-500" },
  completed: { icon: CheckCircle, label: "Completada", color: "text-green-500" },
  materialized: { icon: CheckCircle, label: "Mapa generado", color: "text-green-500" },
  abandoned: { icon: XCircle, label: "Abandonada", color: "text-muted-foreground" },
};

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Hace un momento";
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours} h`;
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

export function InterviewHistorySidebar({
  onNewInterview,
  onResumeSession,
}: InterviewHistorySidebarProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/interviews");
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const recentSessions = sessions.slice(0, 5);
  const hasMore = sessions.length > 5;

  return (
    <div className="w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <span>Historial de entrevistas</span>
        </div>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="space-y-1 pl-2 mt-1">
          <button
            onClick={onNewInterview}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-950 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nueva entrevista
          </button>

          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : sessions.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">
              Sin entrevistas recientes
            </p>
          ) : (
            <>
              {recentSessions.map((session) => {
                const config = statusConfig[session.status] || statusConfig.draft;
                const Icon = config.icon;

                return (
                  <button
                    key={session.id}
                    onClick={() => onResumeSession(session.id)}
                    className="flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted transition-colors group"
                  >
                    <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", config.color)} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {session.topic || session.intentSummary || "Sin título"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {config.label} · {formatRelativeTime(session.updatedAt)}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 mt-0.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              })}

              {hasMore && (
                <button className="flex w-full items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  Ver todas ({sessions.length})
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
