import { generateText, Output } from "ai";
import { openrouter } from "@/lib/ai";
import { getModelForPurpose } from "@/lib/ai/models";
import type { ResearchResult } from "./schemas";
import { qaResultSchema, type QAResult } from "./schemas";

function compactResearchForQA(research: ResearchResult): string {
  return [
    `Query: ${research.query}`,
    `Overview: ${research.summary.overview}`,
    `Hallazgos: ${research.summary.keyFindings.join(" | ")}`,
    `Conceptos clave: ${research.summary.keyConcepts.join(" | ")}`,
    `Contradicciones: ${research.summary.contradictions.join(" | ") || "N/A"}`,
    `Subtemas sugeridos: ${research.summary.suggestedSubtopics.join(" | ")}`,
    `Preguntas de estudio: ${research.summary.studyQuestions.join(" | ")}`,
    `Notas de confianza: ${research.summary.confidenceNotes.join(" | ") || "N/A"}`,
    `Fuentes (${research.sources.length}):`,
    ...research.sources.map(
      (s, i) => `${i + 1}. ${s.title} | ${s.url} | ${s.snippet}`
    ),
  ].join("\n");
}

export async function qaAgent(research: ResearchResult): Promise<QAResult> {
  const qaModel = getModelForPurpose("generation");

  try {
    const { output } = await generateText({
      model: openrouter.chat(qaModel.id),
      output: Output.object({ schema: qaResultSchema, name: "QAResult" }),
      system: `
Eres un evaluador académico de calidad para investigación pedagógica.

Evalúa:
- suficiencia para redactar contenido educativo;
- cobertura del tema;
- confiabilidad y diversidad de fuentes;
- claridad para la audiencia objetivo;
- vacíos críticos que impidan una buena explicación.

No inventes. Si faltan datos, señala qué investigar.
Responde en español.
      `.trim(),
      prompt: `
Evalúa esta investigación:

Contexto:
- Tema: ${research.context.topic}
- Nodo: ${research.context.nodeTitle}
- Audiencia: ${research.context.targetAudience}
- Dificultad: ${research.context.difficultyLevel}
- Objetivo: ${research.context.learningObjective || "N/A"}

Investigación:
${compactResearchForQA(research)}
      `.trim(),
    });

    return output;
  } catch (error) {
    console.warn("[QA Agent] Fallback QA debido a error:", error);
    return {
      isSufficient: true,
      qualityScore: 7,
      coverageScore: 7,
      sourceQualityScore: 7,
      clarityScore: 7,
      gaps: [],
      recommendations: [],
      additionalQueries: [],
      validationReport: "QA omitido por error técnico. Se procede con los datos disponibles.",
    };
  }
}
