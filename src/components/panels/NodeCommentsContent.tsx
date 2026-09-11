"use client";

import { useEffect, useState, useCallback } from "react";
import { MessageSquare, Loader2, Trash2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  authorId: string;
  authorName: string | null;
  authorEmail: string | null;
  authorAvatar: string | null;
}

interface NodeCommentsContentProps {
  mapId: string;
  nodeId: string;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Ahora";
  if (diffMins < 60) return `Hace ${diffMins} min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Hace ${diffHours} h`;
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

export function NodeCommentsContent({ mapId, nodeId }: NodeCommentsContentProps) {
  const { user } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/maps/${mapId}/nodes/${nodeId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Error obteniendo comentarios:", error);
    } finally {
      setIsLoading(false);
    }
  }, [mapId, nodeId]);

  useEffect(() => {
    setIsLoading(true);
    fetchComments();
  }, [fetchComments]);

  const handlePost = async () => {
    const content = draft.trim();
    if (!content) return;
    setIsPosting(true);
    try {
      const response = await fetch(`/api/maps/${mapId}/nodes/${nodeId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (response.ok) {
        setDraft("");
        fetchComments();
      } else {
        const error = await response.json();
        toast.error(error.error || "No se pudo publicar el comentario");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setIsPosting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("¿Eliminar este comentario?")) return;
    try {
      const response = await fetch(`/api/maps/${mapId}/nodes/${nodeId}/comments`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId }),
      });
      if (response.ok) {
        fetchComments();
      } else {
        toast.error("No se pudo eliminar el comentario");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Comentarios</p>

      <div className="flex gap-2">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Añade un comentario..."
          rows={2}
          className="resize-none text-sm"
        />
        <Button
          size="icon"
          className="h-9 w-9 shrink-0 self-end"
          onClick={handlePost}
          disabled={isPosting || !draft.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <MessageSquare className="h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">Sin comentarios</p>
          <p className="mt-1 max-w-[220px] text-xs text-muted-foreground">
            Los comentarios de este nodo aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {comments.map((comment) => {
            const isAuthor = comment.authorId === user?.id;
            return (
              <div key={comment.id} className="rounded-lg border bg-card p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {comment.authorAvatar ? (
                      <img
                        src={comment.authorAvatar}
                        alt=""
                        className="h-5 w-5 rounded-full"
                      />
                    ) : (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-semibold">
                        {(comment.authorName || comment.authorEmail || "?")[0]?.toUpperCase()}
                      </span>
                    )}
                    <span className="text-xs font-medium">
                      {comment.authorName || comment.authorEmail || "Usuario"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(comment.createdAt)}
                    </span>
                  </div>
                  {isAuthor && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(comment.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm">{comment.content}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}