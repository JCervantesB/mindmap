"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Map, MoreHorizontal, Trash2, Copy, Share2, Loader2, Sparkles, Search, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  BlankMapDialog,
} from "@/components/dashboard/BlankMapDialog";
import { UsageCard } from "@/components/dashboard/UsageCard";
import { TemplateDialog } from "@/components/dashboard/TemplateDialog";

interface MapItem {
  id: string;
  title: string;
  description: string | null;
  rootTopic: string;
  visibility: string;
  status: string;
  nodeCount: number;
  createdAt: string;
  updatedAt: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function DashboardPage() {
  const [maps, setMaps] = useState<MapItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBlankMapOpen, setIsBlankMapOpen] = useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "");
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const q = searchParams.get("q") ?? "";

  useEffect(() => {
    const openBlank = () => setIsBlankMapOpen(true);
    window.addEventListener("open-blank-map", openBlank);
    return () => window.removeEventListener("open-blank-map", openBlank);
  }, []);

  useEffect(() => {
    const syncSearch = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail ?? "";
      setSearchInput(detail);
    };
    window.addEventListener("dashboard-search", syncSearch);
    return () => window.removeEventListener("dashboard-search", syncSearch);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      router.replace(
        value.trim()
          ? `/dashboard?q=${encodeURIComponent(value.trim())}`
          : "/dashboard"
      );
    }, 350);
  }, [router]);

  useEffect(() => () => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
  }, []);

  const syncUser = useCallback(async () => {
    try {
      await fetch("/api/users", { method: "POST" });
    } catch (error) {
      console.error("Failed to sync user:", error);
    }
  }, []);

  const fetchMaps = useCallback(async (query = "") => {
    try {
      const url = query ? `/api/maps?q=${encodeURIComponent(query)}` : "/api/maps";
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setMaps(data);
      }
    } catch (error) {
      console.error("Failed to fetch maps:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    async function init() {
      await syncUser();
      await fetchMaps(q);
    }
    init();
  }, [syncUser, fetchMaps, q]);

  const handleCreateMap = async (result: { sessionId: string; mapId?: string }) => {
    if (result.mapId) {
      toast.success("Mapa creado", { description: "Redirigiendo al editor..." });
      router.push(`/dashboard/${result.mapId}`);
    } else {
      toast.error("Error", { description: "No se pudo crear el mapa" });
      fetchMaps();
    }
  };

  const handleDuplicateMap = async (e: React.MouseEvent, mapId: string) => {
    e.stopPropagation();

    try {
      const response = await fetch(`/api/maps/${mapId}/duplicate`, { method: "POST" });
      const data = await response.json().catch(() => null);
      if (response.ok && data?.id) {
        toast.success("Mapa duplicado");
        router.push(`/dashboard/${data.id}`);
      } else {
        toast.error("Error", { description: data?.error || "No se pudo duplicar" });
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const handleDeleteMap = async (e: React.MouseEvent, mapId: string) => {
    e.stopPropagation();

    if (!confirm("¿Estás seguro de que quieres eliminar este mapa?")) {
      return;
    }

    try {
      const response = await fetch(`/api/maps/${mapId}`, { method: "DELETE" });
      if (response.ok) {
        setMaps((prev) => prev.filter((m) => m.id !== mapId));
        toast.success("Mapa eliminado");
      } else {
        toast.error("Error", { description: "No se pudo eliminar" });
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const handleOpenMap = (mapId: string) => {
    router.push(`/dashboard/${mapId}`);
  };

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mis mapas</h1>
          <p className="text-muted-foreground">
            Gestiona tus mapas mentales y aventuras de investigación
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar mapas..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-56 pl-9"
            />
          </div>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setIsTemplateOpen(true)}
          >
            <LayoutTemplate className="h-4 w-4" />
            Plantilla
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setIsBlankMapOpen(true)}
          >
            <Map className="h-4 w-4" />
            Mapa en blanco
          </Button>
        </div>
      </div>

      <UsageCard />

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : maps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Map className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold">No tienes mapas aún</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Crea tu primer mapa mental para comenzar tu investigación
          </p>
          <div className="mt-4 flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setIsBlankMapOpen(true)}
            >
              <Map className="h-4 w-4" />
              Mapa en blanco
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {maps.map((map) => (
            <Card
              key={map.id}
              className="group cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => handleOpenMap(map.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="line-clamp-1">{map.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {map.description || map.rootTopic}
                    </CardDescription>
                  </div>
                    <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground opacity-0 transition-opacity group-hover:opacity-100">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Abrir menú</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => handleDuplicateMap(e, map.id)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleOpenMap(map.id)}>
                          <Share2 className="mr-2 h-4 w-4" />
                          Abrir
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => handleDeleteMap(e, map.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {map.nodeCount} nodos
                    </Badge>
                    {map.visibility === "link_readonly" && (
                      <Badge variant="outline" className="text-xs">
                        Compartido
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(map.updatedAt)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card
            className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center border-dashed transition-colors hover:bg-muted/50"
            onClick={() => setIsBlankMapOpen(true)}
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Plus className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">Crear nuevo mapa</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Comienza una nueva investigación
              </p>
            </div>
          </Card>
        </div>
      )}

      <BlankMapDialog
        open={isBlankMapOpen}
        onOpenChange={setIsBlankMapOpen}
      />
      <TemplateDialog
        open={isTemplateOpen}
        onOpenChange={setIsTemplateOpen}
      />
    </div>
  );
}
