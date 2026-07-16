"use client";

import { Loader2, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type TextPart = { type: 'text'; text: string };

function getMessageText(message: { parts: Array<{ type: string; text?: string }> }): string {
  return message.parts
    .filter((part): part is TextPart => part.type === 'text' && !!part.text)
    .map(part => part.text)
    .join('');
}

interface Message {
  id: string;
  role: string;
  parts: Array<{ type: string; text?: string }>;
}

interface InterviewMessagesProps {
  messages: Message[];
  isLoading: boolean;
  hasError: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function InterviewMessages({
  messages,
  isLoading,
  hasError,
  messagesEndRef,
}: InterviewMessagesProps) {
  return (
    <div className="space-y-4">
      {messages.length === 0 && (
        <div className="flex gap-3">
          <Avatar className="h-8 w-8 bg-primary/10">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              <Sparkles className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="bg-muted rounded-lg px-4 py-2 max-w-[80%]">
            <p className="text-sm">
              Antes de generar tu mapa, necesito entender bien qué necesitas.
              <br /><br />
              ¿Sobre qué tema quieres trabajar? Cuéntame con tus propias palabras qué te interesa aprender o explorar.
            </p>
          </div>
        </div>
      )}
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex gap-3",
            message.role === "user" && "flex-row-reverse"
          )}
        >
          {message.role === "assistant" && (
            <Avatar className="h-8 w-8 bg-primary/10">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                <Sparkles className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          )}
          <div
            className={cn(
              "max-w-[80%] rounded-lg px-4 py-2",
              message.role === "assistant"
                ? "bg-muted text-foreground"
                : "bg-primary text-primary-foreground"
            )}
          >
            {message.role === "assistant" ? (
              <div className="text-sm">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0 whitespace-pre-wrap">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="whitespace-pre-wrap">{children}</li>,
                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                    em: ({ children }) => <em>{children}</em>,
                    code: ({ children }) => <code className="bg-black/10 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                    a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline">{children}</a>,
                    h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-base font-semibold mb-1">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-sm font-medium mb-1">{children}</h3>,
                    blockquote: ({ children }) => <blockquote className="border-l-2 border-muted-foreground/30 pl-3 italic">{children}</blockquote>,
                  }}
                >
                  {getMessageText(message as { parts: Array<{ type: string; text?: string }> })}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm whitespace-pre-wrap">
                {getMessageText(message as { parts: Array<{ type: string; text?: string }> })}
              </p>
            )}
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex gap-3">
          <Avatar className="h-8 w-8 bg-primary/10">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              <Sparkles className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="bg-muted rounded-lg px-4 py-2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        </div>
      )}
      {hasError && (
        <div className="flex gap-3">
          <div className="bg-destructive/10 text-destructive rounded-lg px-4 py-2 max-w-[80%]">
            <p className="text-sm">
              Algo salió mal. ¿Recargamos la conversación e intentamos de nuevo?
            </p>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
