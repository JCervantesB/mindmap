import { generateText, Output } from "ai";
import { openrouter } from "@/lib/ai";
import { getModelForPurpose } from "@/lib/ai/models";
import type { QAResult, ResearchResult, EditorResult, ResearchContext, ResearchSummary } from "./schemas";
import { editorResultSchema } from "./schemas";

function compactSources(research: ResearchResult): string {
  return research.sources
    .slice(0, 8)
    .map((s, i) => `${i + 1}. ${s.title} - ${s.url}`)
    .join("\n");
}

function buildFallbackContent(context: ResearchContext, summary: ResearchSummary): Partial<EditorResult> {
  return {
    title: context.nodeTitle,
    shortSummary: summary.overview.slice(0, 200),
    contentMarkdown: `# ${context.nodeTitle}

## Introducción
${summary.overview}

## Conceptos clave
${summary.keyConcepts.map((c, i) => `${i + 1}. ${c}`).join("\n")}

## Hallazgos principales
${summary.keyFindings.map((f, i) => `- ${f}`).join("\n")}

## Preguntas de estudio
${summary.studyQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}
`,
    learningObjective: context.learningObjective || "Comprender los conceptos fundamentales",
    difficultyLevel: context.difficultyLevel || "intermediate",
    keyConcepts: summary.keyConcepts,
    studyQuestions: summary.studyQuestions,
    sources: [],
  };
}

export async function editorAgent(
  research: ResearchResult,
  qa?: QAResult
): Promise<EditorResult> {
  const { context, summary } = research;

  const editorModel = getModelForPurpose("expansion");

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { output } = await generateText({
        model: openrouter.chat(editorModel.id),
        output: Output.object({ schema: editorResultSchema, name: "EditorResult" }),
        system: `
Eres un redactor pedagógico experto.
Transformas investigación validada en contenido educativo claro, estructurado y útil para un nodo de mapa mental.

IMPORTANTE: Debes responder SOLO con JSON válido, sin texto adicional, sin markdown, sin explicaciones.
El campo contentMarkdown DEBE ser texto markdown válido, pero la respuesta general debe ser JSON puro.
      `.trim(),
        prompt: `
Crea el contenido final para este nodo. Responde SOLO con JSON válido.

Contexto:
- Tema: ${context.topic}
- Nodo: ${context.nodeTitle}
- Tema raíz: ${context.rootTopic}
- Nodo padre: ${context.parentTopic || "N/A"}
- Audiencia: ${context.targetAudience}
- Dificultad objetivo: ${context.difficultyLevel}
- Objetivo de aprendizaje: ${context.learningObjective || "N/A"}

Base de investigación:
- Overview: ${summary.overview}
- Hallazgos: ${summary.keyFindings.join(" | ")}
- Conceptos clave: ${summary.keyConcepts.join(" | ")}
- Subtemas sugeridos: ${summary.suggestedSubtopics.join(" | ")}
- Preguntas de estudio sugeridas: ${summary.studyQuestions.join(" | ")}

QA:
- ¿Suficiente?: ${qa?.isSufficient ? "Sí" : "No/N.A."}
- Score calidad: ${qa?.qualityScore ?? "N/A"}
- Gaps: ${qa?.gaps.join(" | ") || "N/A"}
- Recomendaciones: ${qa?.recommendations.join(" | ") || "N/A"}

Devuelve SOLO JSON con esta estructura exacta:
{
  "title": "título del nodo",
  "shortSummary": "resumen breve de 1-2 oraciones",
  "contentMarkdown": "contenido en markdown con ## headings",
  "learningObjective": "objetivo de aprendizaje",
  "difficultyLevel": "beginner|intermediate|advanced",
  "keyConcepts": ["concepto1", "concepto2"],
  "studyQuestions": ["pregunta1", "pregunta2"],
  "sources": []
}
      `.trim(),
      });

      return output;
    } catch (error) {
      console.warn(`[Editor Agent] Intento ${attempt + 1} fallido:`, error);
      if (attempt === 1) {
        console.error("[Editor Agent] Agotados los intentos, usando fallback");
        const fallback = buildFallbackContent(context, summary);
        return {
          title: fallback.title!,
          shortSummary: fallback.shortSummary!,
          contentMarkdown: fallback.contentMarkdown!,
          learningObjective: fallback.learningObjective!,
          difficultyLevel: fallback.difficultyLevel!,
          keyConcepts: fallback.keyConcepts!,
          studyQuestions: fallback.studyQuestions!,
          sources: fallback.sources!,
        };
      }
    }
  }

  throw new Error("Editor agent falló");
}
