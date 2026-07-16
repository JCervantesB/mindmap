import { Exa } from "exa-js";
import { generateText, Output } from "ai";
import { openrouter } from "@/lib/ai";
import { getModelForPurpose } from "@/lib/ai/models";
import {
  type ResearchContext,
  type ResearchResult,
  type ResearchSource,
  researchSummarySchema,
} from "./schemas";

const exa = new Exa(process.env.EXA_API_KEY || "");

function buildResearchQuery(context: ResearchContext): string {
  const parts = [
    context.topic,
    context.rootTopic !== context.topic ? `tema raíz: ${context.rootTopic}` : "",
    context.parentTopic ? `subtema de: ${context.parentTopic}` : "",
    context.learningObjective ? `objetivo: ${context.learningObjective}` : "",
    "explicación clara",
    "conceptos clave",
    "fuentes confiables",
  ];

  return parts.filter(Boolean).join(" | ");
}

function normalizeSource(result: {
  title?: string | null;
  url: string;
  text?: string;
  highlights?: string[] | { text?: string }[];
}): ResearchSource {
  const highlights = Array.isArray(result.highlights)
    ? result.highlights
        .map((item) => (typeof item === "string" ? item : item?.text || ""))
        .filter(Boolean)
    : [];

  return {
    title: result.title?.trim() || "Sin título",
    url: result.url,
    snippet: highlights[0] || result.text?.slice(0, 280) || "",
    content: result.text,
    highlights,
  };
}

function buildPromptSources(sources: ResearchSource[]): string {
  return sources
    .map((source, index) =>
      [
        `Fuente ${index + 1}`,
        `Título: ${source.title}`,
        `URL: ${source.url}`,
        `Snippet: ${source.snippet}`,
        `Highlights: ${source.highlights.join(" | ") || "N/A"}`,
        `Contenido: ${source.content?.slice(0, 1400) || ""}`,
      ].join("\n")
    )
    .join("\n\n---\n\n");
}

export async function researcherAgent(
  context: ResearchContext,
  maxResults = 8
): Promise<ResearchResult> {
  const query = buildResearchQuery(context);

  const searchResponse = await exa.search(query, {
    numResults: maxResults,
    contents: {
      text: { maxCharacters: 2500 },
      highlights: { maxCharacters: 700, query: context.topic },
    },
  });

  const sources = searchResponse.results
    .map(normalizeSource)
    .filter((source) => source.title || source.snippet || source.content);

  if (sources.length === 0) {
    throw new Error("No se encontraron fuentes útiles para este tema.");
  }

  const deduplicatedSources = sources.filter(
    (source, index, self) =>
      index === self.findIndex((s) => s.url === source.url)
  );

  const researchModel = getModelForPurpose("research");
  const { output: summary } = await generateText({
    model: openrouter.chat(researchModel.id),
    output: Output.object({ schema: researchSummarySchema, name: "ResearchSummary" }),
    system: `
Eres un investigador pedagógico.
Tu trabajo es convertir resultados de investigación en una base útil para estudiar, enseñar y expandir un mapa mental.

Reglas:
- No inventes hechos.
- Resume con claridad pedagógica.
- Detecta vacíos y contradicciones.
- Propón subtemas útiles para nodos hijos.
- Redacta en español.
    `.trim(),
    prompt: `
Contexto del nodo:
- Tema: ${context.topic}
- Nodo actual: ${context.nodeTitle}
- Tema raíz: ${context.rootTopic}
- Nodo padre: ${context.parentTopic || "N/A"}
- Audiencia: ${context.targetAudience}
- Dificultad: ${context.difficultyLevel}
- Objetivo: ${context.learningObjective || "N/A"}
- Contexto extra: ${context.additionalContext || "N/A"}

Fuentes encontradas:
${buildPromptSources(deduplicatedSources)}
    `.trim(),
  });

  return {
    context,
    query,
    sources: deduplicatedSources,
    summary,
  };
}
