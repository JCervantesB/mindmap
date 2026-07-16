"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, Users, Link2, Copy, Trash2, Plus } from "lucide-react";
import { useUIStore } from "@/store/ui";

interface Collaborator {
  id: string;
  userId?: string;
  email?: string;
  displayName?: string;
  role: string;
  acceptedAt?: string;
}

interface ShareLink {
  id: string;
  token: string;
  accessMode: string;
  expiresAt?: string;
  url: string;
}

interface CollaboratorDialogProps {
  mapId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CollaboratorDialog({ mapId, open, onOpenChange }: CollaboratorDialogProps) {
  const { addToast } = useUIStore();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [links, setLinks] = useState<ShareLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [inviting, setInviting] = useState(false);

  const [activeTab, setActiveTab] = useState<"collaborators" | "share">("collaborators");

  useState(() => {
    if (open) {
      loadData();
    }
  });

  async function loadData() {
    setLoading(true);
    try {
      const [collabRes, linksRes] = await Promise.all([
        fetch(`/api/maps/${mapId}/collaborators`),
        fetch(`/api/maps/${mapId}/share-links`),
      ]);

      if (collabRes.ok) {
        const data = await collabRes.json();
        setCollaborators([...(data.owner ? [data.owner] : []), ...data.collaborators]);
      }

      if (linksRes.ok) {
        const data = await linksRes.json();
        setLinks(data.map((l: { id: string; token: string; accessMode: string; expiresAt?: string }) => ({
          ...l,
          url: `/share/${l.token}`,
        })));
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite() {
    if (!inviteEmail.trim()) return;

    setInviting(true);
    try {
      const response = await fetch(`/api/maps/${mapId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      if (response.ok) {
        const newCollaborator = await response.json();
        setCollaborators([...collaborators, newCollaborator]);
        setInviteEmail("");
        addToast({ type: "success", message: "Colaborador agregado" });
      } else {
        const error = await response.json();
        addToast({ type: "error", message: error.error || "Error al invitar" });
      }
    } catch (error) {
      console.error("Error inviting:", error);
      addToast({ type: "error", message: "Error al invitar colaborador" });
    } finally {
      setInviting(false);
    }
  }

  async function handleRemove(collaboratorId: string) {
    try {
      const response = await fetch(`/api/maps/${mapId}/collaborators`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collaboratorId }),
      });

      if (response.ok) {
        setCollaborators(collaborators.filter((c) => c.id !== collaboratorId));
        addToast({ type: "success", message: "Colaborador removido" });
      }
    } catch (error) {
      console.error("Error removing:", error);
      addToast({ type: "error", message: "Error al remover colaborador" });
    }
  }

  async function handleCreateLink() {
    try {
      const response = await fetch(`/api/maps/${mapId}/share-links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expiresInDays: 30 }),
      });

      if (response.ok) {
        const newLink = await response.json();
        setLinks([...links, newLink]);
        addToast({ type: "success", message: "Link creado" });
      }
    } catch (error) {
      console.error("Error creating link:", error);
      addToast({ type: "error", message: "Error al crear link" });
    }
  }

  async function handleRevokeLink(linkId: string) {
    try {
      const response = await fetch(`/api/maps/${mapId}/share-links`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkId }),
      });

      if (response.ok) {
        setLinks(links.filter((l) => l.id !== linkId));
        addToast({ type: "success", message: "Link revocado" });
      }
    } catch (error) {
      console.error("Error revoking:", error);
      addToast({ type: "error", message: "Error al revocar link" });
    }
  }

  async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text);
    addToast({ type: "success", message: "Copiado al portapapeles" });
  }

  const roleColors: Record<string, string> = {
    owner: "bg-purple-100 text-purple-800",
    editor: "bg-blue-100 text-blue-800",
    commenter: "bg-yellow-100 text-yellow-800",
    viewer: "bg-gray-100 text-gray-800",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Colaboradores y compartir</DialogTitle>
          <DialogDescription>
            Gestiona quién puede acceder a este mapa
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === "collaborators" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("collaborators")}
          >
            <Users className="h-4 w-4 mr-1" />
            Colaboradores
          </Button>
          <Button
            variant={activeTab === "share" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("share")}
          >
            <Link2 className="h-4 w-4 mr-1" />
            Links
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : activeTab === "collaborators" ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Email del usuario"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="editor">Editor</option>
                <option value="commenter">Comentarista</option>
                <option value="viewer">Viewer</option>
              </select>
              <Button onClick={handleInvite} disabled={inviting || !inviteEmail.trim()}>
                {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {collaborators.map((collab) => (
                <div
                  key={collab.id}
                  className="flex items-center justify-between p-2 border rounded-md"
                >
                  <div>
                    <p className="text-sm font-medium">{collab.displayName || collab.email}</p>
                    <p className="text-xs text-muted-foreground">{collab.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={roleColors[collab.role] || "bg-gray-100"}>
                      {collab.role}
                    </Badge>
                    {collab.role !== "owner" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(collab.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Button onClick={handleCreateLink} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Crear link de compartición
            </Button>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-2 border rounded-md"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono truncate">{link.url}</p>
                    <p className="text-xs text-muted-foreground">
                      {link.expiresAt
                        ? `Expira: ${new Date(link.expiresAt).toLocaleDateString()}`
                        : "Sin expiración"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(`${window.location.origin}${link.url}`)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRevokeLink(link.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              {links.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay links de compartición
                </p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
