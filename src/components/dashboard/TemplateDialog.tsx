"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutTemplate, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MAP_TEMPLATES } from "@/lib/templates";

interface TemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TemplateDialog({ open, onOpenChange }: TemplateDialogProps) {
  const [creatingId, setCreatingId] = useState<string | null>(null);
  const router = useRouter();

  const handleCreate = async (templateId: string) => {
    setCreatingId(templateId);
    try {
      const response = await fetch("/api/maps/from-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });
      const data = await response.json().catch(() => null);
      if (response.ok && data?.id) {
        toast.success("Mapa creado desde plantilla");
        onOpenChange(false);
        router.push(`/dashboard/${data.id}`);
      } else {
        toast.error("Error", { description: data?.error || "No se pudo crear el mapa" });
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setCreatingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5" />
            Crear desde plantilla
          </DialogTitle>
          <DialogDescription>
            Elige una estructura inicial; podrás editar y expandir cada nodo después.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-2">
          {MAP_TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => handleCreate(template.id)}
              disabled={creatingId !== null}
              className="flex items-start justify-between gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-muted/50 disabled:opacity-60"
            >
              <div>
                <p className="text-sm font-medium">{template.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{template.description}</p>
              </div>
              {creatingId === template.id ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <span className="mt-0.5 text-xs font-medium text-primary">Usar</span>
              )}
            </button>
          ))}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}