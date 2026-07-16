"use client";

import { ArrowRight, SkipForward, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InterviewFooterProps {
  isCreatingMap: boolean;
  canGenerate: boolean;
  onSkip: () => void;
  onComplete: () => void;
}

export function InterviewFooter({
  isCreatingMap,
  canGenerate,
  onSkip,
  onComplete,
}: InterviewFooterProps) {
  return (
    <div className="flex gap-2 sm:gap-0 shrink-0">
      <Button
        variant="ghost"
        size="sm"
        onClick={onSkip}
        disabled={isCreatingMap}
      >
        <SkipForward className="mr-2 h-4 w-4" />
        Omitir entrevista
      </Button>
      <Button
        onClick={onComplete}
        disabled={!canGenerate || isCreatingMap}
        className="gap-2"
      >
        {isCreatingMap ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ArrowRight className="h-4 w-4" />
        )}
        Generar mapa
      </Button>
    </div>
  );
}
