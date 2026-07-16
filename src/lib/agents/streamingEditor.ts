import { streamText } from "ai";
import { openrouter } from "@/lib/ai";
import { getModelForPurpose } from "@/lib/ai/models";
import type { QAResult, ResearchResult } from "./schemas";

function compactSources(research: ResearchResult): string {
  return research.sources
    .slice(0, 8)
    .map((s, i) => `${i + 1}. ${s.title} - ${s.url}`)
    .join("\n");
}

export function createStreamingEditorPrompt(
  research: ResearchResult,
  qa?: QAResult
): { system: string; prompt: string } {
  const { context, summary } = research;

  const system = `Eres un redactor pedagógico experto.
Transformas investigación validada en contenido educativo claro, estructurado y útil para un nodo de mapa mental.

Redacta en español. Sé pedagógico, no enciclopédico. Usa Markdown limpio.
Incluye: Introducción, Qué es, Por qué importa, Conceptos clave, Ejemplo práctico, Errores comunes, Resumen, Preguntas.
No inventes fuentes.`;

  const prompt = `Contexto:
- Tema: ${context.topic}
- Nodo: ${context.nodeTitle}
- Tema raíz: ${context.rootTopic}
- Nodo padre: ${context.parentTopic || "N/A"}
- Audiencia: ${context.targetAudience}
- Dificultad: ${context.difficultyLevel}
- Objetivo: ${context.learningObjective || "N/A"}

Investigación:
${summary.overview}

Conceptos: ${summary.keyConcepts.join(" | ")}
Hallazgos: ${summary.keyFindings.join(" | ")}
Preguntas: ${summary.studyQuestions.join(" | ")}

QA - Score: ${qa?.qualityScore ?? "N/A"} - Gaps: ${qa?.gaps.join(" | ") || "N/A"}

Fuentes:
${compactSources(research)}

Redacta el contenido completo para este nodo en Markdown.`;

  return { system, prompt };
}

export function streamEditorContent(research: ResearchResult, qa?: QAResult) {
  const editorModel = getModelForPurpose("expansion");
  const { system, prompt } = createStreamingEditorPrompt(research, qa);

  return streamText({
    model: openrouter.chat(editorModel.id),
    system,
    prompt,
  });
}
