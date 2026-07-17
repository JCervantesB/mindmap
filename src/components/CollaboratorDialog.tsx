"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Loader2, Users, Link2, Copy, Trash2, Plus, Search, X } from "lucide-react";
import { useUIStore } from "@/store/ui";

interface User {
  id: string;
  email: string;
  displayName?: string;
}

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
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);

  const loadData = useCallback(async () => {
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
          url: `${baseUrl}/share/${l.token}`,
        })));
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, [mapId, baseUrl]);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, loadData]);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.users || []);
        }
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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

  async function handleAddUser(user: User) {
    setInviting(true);
    try {
      const response = await fetch(`/api/maps/${mapId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, role: inviteRole }),
      });

      if (response.ok) {
        const newCollaborator = await response.json();
        setCollaborators([...collaborators, newCollaborator]);
        setSearchQuery("");
        setSearchResults([]);
        addToast({ type: "success", message: `Usuario agregado` });
      } else {
        const error = await response.json();
        addToast({ type: "error", message: error.error || "Error al agregar" });
      }
    } catch (error) {
      console.error("Error adding user:", error);
      addToast({ type: "error", message: "Error al agregar usuario" });
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
        setLinks([...links, { ...newLink, url: `${baseUrl}/share/${newLink.token}` }]);
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
    const fullUrl = text.startsWith('http') ? text : `${baseUrl}${text}`;
    await navigator.clipboard.writeText(fullUrl);
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
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar usuario..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => { setSearchQuery(""); setSearchResults([]); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  <option value="editor">Editor</option>
                  <option value="commenter">Comentarista</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              {searchResults.length > 0 && (
                <div className="border rounded-md max-h-40 overflow-y-auto">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleAddUser(user)}
                      className="w-full flex items-center justify-between p-2 hover:bg-muted/50 text-left"
                      disabled={inviting}
                    >
                      <div>
                        <p className="text-sm font-medium">{user.displayName || user.email}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}
              {searching && (
                <div className="flex justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">o agregar por email</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Email del usuario"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1"
              />
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
                      onClick={() => copyToClipboard(link.url)}
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
