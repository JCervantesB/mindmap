"use client";

import { Sparkles, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useInterview } from "./useInterview";
import { InterviewMessages } from "./InterviewMessages";
import { InterviewInput } from "./InterviewInput";
import { InterviewFooter } from "./InterviewFooter";

interface InterviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (result: { sessionId: string; mapId?: string }) => void;
  resumeSessionId?: string | null;
}

export function InterviewDialog({
  open,
  onOpenChange,
  onComplete,
  resumeSessionId,
}: InterviewDialogProps) {
  const {
    messages,
    sendMessage,
    status,
    error,
    isLoading,
    isCreatingMap,
    generationStatus,
    messagesEndRef,
    skip,
    complete,
    isDone,
    context,
  } = useInterview({ onComplete, resumeSessionId });

  const canGenerate = resumeSessionId
    ? !!(context?.topic)
    : messages.length >= 3;

  const handleComplete = async () => {
    if (isCreatingMap) return;
    const result = await complete();
    if (result?.mapId) {
      onComplete(result);
    }
  };

  const handleSkip = () => {
    skip();
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && isCreatingMap) return;
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-150 h-[80vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Crear nuevo mapa
          </DialogTitle>
          <DialogDescription>
            Charla con el asistente para personalizar tu mapa mental
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0" ref={messagesEndRef}>
          <InterviewMessages
            messages={messages as Array<{ id: string; role: string; parts: Array<{ type: string; text?: string }> }>}
            isLoading={isLoading}
            hasError={!!error}
            messagesEndRef={messagesEndRef}
          />
          {isCreatingMap && (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-sm font-medium">{generationStatus}</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Esto puede tardar unos segundos mientras generamos tu mapa mental con IA...
              </p>
            </div>
          )}
        </ScrollArea>

        <InterviewInput
          onSend={sendMessage}
          disabled={status !== "ready"}
          isCreatingMap={isCreatingMap}
        />

        <DialogFooter className="gap-2 sm:gap-0 shrink-0">
          <InterviewFooter
            isCreatingMap={isCreatingMap}
            canGenerate={canGenerate}
            onSkip={handleSkip}
            onComplete={handleComplete}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
