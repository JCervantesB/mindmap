"use client";

import { useState, useCallback } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface InterviewInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
  isCreatingMap: boolean;
}

export function InterviewInput({ onSend, disabled, isCreatingMap }: InterviewInputProps) {
  const [input, setInput] = useState("");

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
  }, [input, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2">
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Escribe tu respuesta..."
        className="min-h-15"
        disabled={disabled || isCreatingMap}
      />
      <Button
        onClick={handleSend}
        disabled={disabled || !input.trim() || isCreatingMap}
        size="icon"
        className="shrink-0"
      >
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
