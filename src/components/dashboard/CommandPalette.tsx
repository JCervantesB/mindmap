"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Map, MessageSquare, Plus, Sun, Moon, FileCode2 } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

interface PaletteMap {
  id: string;
  title: string;
}

interface CommandPaletteProps {
  onNewInterview?: () => void;
}

export function CommandPalette({ onNewInterview }: CommandPaletteProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [maps, setMaps] = useState<PaletteMap[]>([]);

  const loadMaps = useCallback(async () => {
    try {
      const response = await fetch("/api/maps");
      if (response.ok) {
        const data = await response.json();
        setMaps(
          data
            .map((m: PaletteMap) => ({ id: m.id, title: m.title }))
            .slice(0, 8)
        );
      }
    } catch (error) {
      console.error("Error cargando mapas para la paleta:", error);
    }
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        loadMaps();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [loadMaps]);

  const run = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  const toggleTheme = () => {
    const root = document.documentElement;
    root.classList.toggle("dark");
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Paleta de comandos">
      <CommandInput placeholder="Escribe un comando o busca un mapa..." />
      <CommandList>
        <CommandEmpty>Sin resultados</CommandEmpty>
        <CommandGroup heading="Acciones">
          <CommandItem onSelect={() => run(() => router.push("/dashboard"))}>
            <Map className="mr-2 h-4 w-4" />
            Mis mapas
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(() => {
                onNewInterview?.();
                router.push("/dashboard");
              })
            }
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Nueva entrevista
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(() => {
                window.dispatchEvent(new CustomEvent("open-blank-map"));
                router.push("/dashboard");
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Crear mapa en blanco
          </CommandItem>
          <CommandItem onSelect={() => run(toggleTheme)}>
            <Sun className="mr-2 h-4 w-4" />
            Cambiar tema
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Mapas">
          {maps.map((map) => (
            <CommandItem
              key={map.id}
              onSelect={() => run(() => router.push(`/dashboard/${map.id}`))}
            >
              <FileCode2 className="mr-2 h-4 w-4" />
              {map.title}
            </CommandItem>
          ))}
          {maps.length === 0 && (
            <CommandItem disabled>
              <Moon className="mr-2 h-4 w-4" />
              No hay mapas disponibles
            </CommandItem>
          )}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}