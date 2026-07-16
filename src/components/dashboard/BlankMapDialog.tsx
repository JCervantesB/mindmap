"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Map } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface BlankMapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BlankMapDialog({ open, onOpenChange }: BlankMapDialogProps) {
  const [title, setTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("El título es requerido");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/maps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          rootTopic: title.trim(),
        }),
      });

      if (response.ok) {
        const map = await response.json();
        toast.success("Mapa creado", { description: "Redirigiendo al editor..." });
        onOpenChange(false);
        setTitle("");
        router.push(`/dashboard/${map.id}`);
      } else {
        const error = await response.json();
        toast.error("Error", { description: error.error || "No se pudo crear el mapa" });
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setTitle("");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            Crear mapa en blanco
          </DialogTitle>
          <DialogDescription>
            Crea un lienzo vacío para construir tu mapa mental desde cero
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Input
            placeholder="Título del mapa mental"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={isCreating || !title.trim()}>
            {isCreating ? "Creando..." : "Crear mapa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
