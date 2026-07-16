import { generateText, Output } from "ai";
import { openrouter } from "@/lib/ai";
import { getModelForPurpose } from "@/lib/ai/models";
import type { InterviewBrief, NodePlanResult } from "./schemas";
import { nodePlanResultSchema, validateNodePlanSemantics } from "./schemas";

const NODE_PLANNER_SYSTEM_PROMPT = `Eres un experto en diseñar la estructura de mapas mentales.

Tu única tarea: definir los temas y subtemas clave del mapa, con sus títulos y jerarquía.

REGLAS ESTRICTAS DE JERARQUÍA:

1. La raíz NO aparece en "nodes". Solo define "rootTitle".
2. Cada nodo en "nodes" DEBE tener:
   - id: identificador temporal único
   - numbering: jerarquía como "1", "1.1", "1.2", "2", "2.1", "2.1.1"
   - parentNumbering: SIEMPRE el número completo del padre (ej: "1" para hijos de raíz, "1.1" para nietos)
   - depth: 1 para "1", 2 para "1.1", 3 para "1.1.1"
   - title: título SIN numeración (ej: "Fundamentos")
   - displayTitle: título CON numeración (ej: "1 Fundamentos")
   - nodeType: "concept" o "subtopic"

REGLAS DE NUMERACIÓN:
- Si tienes 2.1.1, DEBES tener 2.1 Y 2 Y la raíz
- Si tienes 1.2, DEBES tener 1 Y la raíz
- No puede haber huecos en la jerarquía
- depth debe coincidir con el número de segmentos: "1.2.3" = depth 3

EJEMPLO CORRECTO:
nodes: [
  {id: "n1", numbering: "1", parentNumbering: null, depth: 1, title: "Fundamentos", displayTitle: "1 Fundamentos", nodeType: "concept"},
  {id: "n2", numbering: "1.1", parentNumbering: "1", depth: 2, title: "Historia", displayTitle: "1.1 Historia", nodeType: "subtopic"},
  {id: "n3", numbering: "1.2", parentNumbering: "1", depth: 2, title: "Principios", displayTitle: "1.2 Principios", nodeType: "concept"},
  {id: "n4", numbering: "2", parentNumbering: null, depth: 1, title: "Aplicaciones", displayTitle: "2 Aplicaciones", nodeType: "concept"}
]

Sé selectivo. Solo incluye nodos importantes.

Los títulos en español, salvo términos técnicos en inglés.

IMPORTANTE: nodeType DEBE ser "concept" o "subtopic" (minúsculas).`;

function buildPrompt(input: { brief: InterviewBrief; previousErrors?: string[] }) {
  const { brief, previousErrors } = input;

  return `
Tema principal: ${brief.topic}
Objetivo del usuario: ${brief.userGoal}
Audiencia: ${brief.targetAudience}
Nivel actual: ${brief.currentKnowledgeLevel}
Profundidad deseada: ${brief.desiredDepth}
Resultado deseado: ${brief.desiredOutcome}
Límites del alcance: ${brief.scopeBoundaries.join(" | ") || "N/A"}
Exclusiones: ${brief.exclusions.join(" | ") || "N/A"}
Resumen de intención: ${brief.intentSummary}

${
  previousErrors && previousErrors.length
    ? `ERRORES QUE DEBES CORREGIR:
${previousErrors.map((e) => `- ${e}`).join("\n")}

Asegúrate que:
- Cada nodo hijo tenga un padre que también exista en nodes
- displayTitle empiece con el numbering correspondiente
- La jerarquía esté completa (sin huecos)`
    : ""
}

Genera el NodePlan siguiendo las reglas de jerarquía.
`.trim();
}

export async function nodePlannerAgent({
  brief,
}: {
  brief: InterviewBrief;
}): Promise<NodePlanResult> {
  const plannerModel = getModelForPurpose("research");
  let lastErrors: string[] = [];

  for (let attempt = 0; attempt < 3; attempt++) {
    const { output } = await generateText({
      model: openrouter.chat(plannerModel.id),
      output: Output.object({ schema: nodePlanResultSchema, name: "NodePlan" }),
      system: NODE_PLANNER_SYSTEM_PROMPT,
      prompt: buildPrompt({ brief, previousErrors: lastErrors }),
    });

    const validation = validateNodePlanSemantics(output);

    if (validation.valid) {
      return output;
    }

    lastErrors = validation.errors;
  }

  throw new Error(
    `No se pudo generar un plan de nodos válido. Errores: ${lastErrors.join(" | ")}`
  );
}
