"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-7 w-7 text-destructive" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">Algo salió mal</h2>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          Ocurrió un error inesperado. Puedes intentar de nuevo o recargar la página.
        </p>
      </div>
      <Button onClick={reset} className="gap-2">
        <RotateCcw className="h-4 w-4" />
        Reintentar
      </Button>
    </div>
  );
}