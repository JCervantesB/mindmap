import { useState, useCallback, useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { toast } from "sonner";
import type { InterviewContext } from "@/types/interview";

type TextPart = { type: 'text'; text: string };

function getMessageText(message: { parts: Array<{ type: string; text?: string }> }): string {
  return message.parts
    .filter((part): part is TextPart => part.type === 'text' && !!part.text)
    .map(part => part.text)
    .join('');
}

interface UseInterviewOptions {
  onComplete: (result: { sessionId: string; mapId?: string }) => void;
  resumeSessionId?: string | null;
}

export function useInterview({ onComplete, resumeSessionId }: UseInterviewOptions) {
  const [isDone, setIsDone] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isCreatingMap, setIsCreatingMap] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string>("");
  const [context, setContext] = useState<InterviewContext | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    async onFinish({ message }) {
      const content = getMessageText(message as { parts: Array<{ type: string; text?: string }> });
      if (content.includes("mapa se generar") || content.includes("tengo suficiente")) {
        const ctx = extractContextFromMessages();
        setContext(ctx);
        await saveSession(ctx);
      }
    },
  });

  const extractContextFromMessages = useCallback((): InterviewContext => {
    const userMessages = messages.filter((m) => m.role === "user");
    const answers = userMessages.map((m) =>
      getMessageText(m as { parts: Array<{ type: string; text?: string }> })
    );

    return {
      topic: answers[0] || "",
      objective: answers[1] || "study",
      audience: answers[3] || "",
      knowledgeLevel: answers[2] || "intermediate",
      depthPreference: answers[4] || "medium",
    };
  }, [messages]);

  const createSession = useCallback(async () => {
    try {
      const response = await fetch("/api/interviews", { method: "POST" });
      if (response.ok) {
        const session = await response.json();
        setSessionId(session.id);
        return session.id;
      }
    } catch (err) {
      console.error("Error creating session:", err);
    }
    return null;
  }, []);

  const saveSession = useCallback(async (ctx: InterviewContext) => {
    if (!sessionId) return;

    try {
      await fetch(`/api/interviews/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: ctx.topic,
          objective: ctx.objective,
          audience: ctx.audience,
          knowledgeLevel: ctx.knowledgeLevel,
          depthPreference: ctx.depthPreference,
          conversationJson: JSON.stringify(messages.map(m => ({
            role: m.role,
            content: getMessageText(m as { parts: Array<{ type: string; text?: string }> }),
          }))),
          status: "completed",
        }),
      });
    } catch (err) {
      console.error("Error saving session:", err);
    }
  }, [sessionId, messages]);

  const materializeSession = useCallback(async () => {
    if (!sessionId) return null;

    setIsCreatingMap(true);
    setGenerationStatus("Creando mapa...");

    try {
      setGenerationStatus("Investigando tema con IA...");
      const response = await fetch(`/api/interviews/${sessionId}`, { method: "POST" });
      if (response.ok) {
        const data = await response.json();
        setGenerationStatus("Generando estructura del mapa...");
        return data;
      } else {
        const error = await response.json();
        toast.error("Error", { description: error.error || "No se pudo crear el mapa" });
        setIsCreatingMap(false);
        setGenerationStatus("");
        return null;
      }
    } catch {
      toast.error("Error de conexión");
      setIsCreatingMap(false);
      setGenerationStatus("");
      return null;
    }
  }, [sessionId]);

  const skip = useCallback(() => {
    if (sessionId) {
      fetch(`/api/interviews/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "abandoned" }),
      });
    }
    setIsDone(true);
    onComplete({ sessionId: sessionId || "" });
  }, [sessionId, onComplete]);

  const complete = useCallback(async (): Promise<{ sessionId: string; mapId?: string } | null> => {
    const ctx = context || extractContextFromMessages();
    await saveSession(ctx);

    const result = await materializeSession();

    setIsCreatingMap(false);
    setGenerationStatus("");

    if (result?.map) {
      toast.success("Mapa creado exitosamente", { description: "Redirigiendo al editor..." });
      return { sessionId: sessionId || "", mapId: result.map.id };
    }

    setIsDone(true);
    return { sessionId: sessionId || "" };
  }, [context, extractContextFromMessages, saveSession, materializeSession, sessionId]);

  const send = useCallback(async (text: string) => {
    if (!sessionId && !resumeSessionId && !hasStarted) {
      setHasStarted(true);
      const newSessionId = await createSession();
      if (newSessionId) {
        setSessionId(newSessionId);
      }
    }
    sendMessage({ text });
  }, [sendMessage, sessionId, resumeSessionId, hasStarted, createSession]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => {
    if (!resumeSessionId) return;

    const loadSession = async () => {
      try {
        const response = await fetch(`/api/interviews/${resumeSessionId}`);
        if (response.ok) {
          const session = await response.json();
          console.log("[useInterview] Session loaded:", session);
          console.log("[useInterview] conversationJson:", session.conversationJson);
          setSessionId(session.id);
          setContext({
            topic: session.topic || "",
            objective: session.objective || "study",
            audience: session.audience || "",
            knowledgeLevel: session.knowledgeLevel || "intermediate",
            depthPreference: session.depthPreference || "medium",
          });

          if (session.conversationJson) {
            try {
              let conversation = session.conversationJson;
              if (typeof conversation === "string") {
                conversation = JSON.parse(conversation);
              }
              if (typeof conversation === "string") {
                conversation = JSON.parse(conversation);
              }
              console.log("[useInterview] Parsed conversation:", conversation);
              if (Array.isArray(conversation) && conversation.length > 0) {
                const restoredMessages = conversation.map((msg: { role: "user" | "assistant"; content: string }, index: number) => ({
                  id: `restored-${index}`,
                  role: msg.role as "user" | "assistant",
                  parts: [{ type: "text" as const, text: msg.content }],
                }));
                console.log("[useInterview] Restored messages:", restoredMessages);
                setMessages(restoredMessages);
              }
            } catch (e) {
              console.error("Error parsing conversation:", e);
            }
          } else {
            console.log("[useInterview] No conversationJson found");
          }
        }
      } catch (err) {
        console.error("Error loading session:", err);
      }
    };

    loadSession();
  }, [resumeSessionId, setMessages]);

  return {
    messages,
    sendMessage: send,
    status,
    error,
    isLoading: status === "streaming" || status === "submitted",
    isCreatingMap,
    generationStatus,
    messagesEndRef,
    skip,
    complete,
    isDone,
    context,
  };
}
