import { z } from "zod";

export const difficultySchema = z.enum(["beginner", "intermediate", "advanced"]);
export type DifficultyLevel = z.infer<typeof difficultySchema>;

export const interviewBriefSchema = z.object({
  topic: z.string().min(1),
  userGoal: z.string().min(1),
  targetAudience: z.string().default("estudiantes universitarios"),
  currentKnowledgeLevel: z.enum(["beginner", "intermediate", "advanced"]).default("intermediate"),
  desiredDepth: z.enum(["shallow", "medium", "deep"]).default("medium"),
  desiredOutcome: z.enum(["study", "teach", "research", "documentation"]).default("study"),
  scopeBoundaries: z.array(z.string()).default([]),
  preferredPerspective: z.string().optional(),
  preferredSources: z.array(z.string()).default([]),
  practicalFocus: z.array(z.string()).default([]),
  exclusions: z.array(z.string()).default([]),
  intentSummary: z.string(),
});
export type InterviewBrief = z.infer<typeof interviewBriefSchema>;

const numberingRegex = z.string().regex(
  /^\d+(\.\d+)*$/,
  "El numbering debe ser jerárquico: 1, 1.1, 1.1.1"
);

export const plannedNodeSchema = z.object({
  id: z.string().min(1).describe("ID temporal único dentro del plan"),
  numbering: numberingRegex.describe("Numeración jerárquica del nodo"),
  parentNumbering: numberingRegex.nullable().describe("Numeración del nodo padre. Null si es hijo directo de la raíz"),
  depth: z.number().int().min(1).max(6).describe("Nivel de profundidad en el árbol"),
  title: z.string().min(1).describe("Título SIN numeración"),
  displayTitle: z.string().min(1).describe('Título con numeración, ej: "1 Fundamentos"'),
  nodeType: z.enum(["concept", "subtopic"]).transform(v => v.toLowerCase() as "concept" | "subtopic"),
});
export type PlannedNode = z.infer<typeof plannedNodeSchema>;

export const nodePlanResultSchema = z.object({
  rootTitle: z.string().min(1),
  mapGoal: z.string().min(1),
  organizationStrategy: z.enum([
    "foundations-first",
    "process-first",
    "problem-solution",
    "theory-to-practice",
    "taxonomy",
  ]),
  criticalConcepts: z.array(z.string()).min(1),
  nodes: z.array(plannedNodeSchema).min(1),
});
export type NodePlanResult = z.infer<typeof nodePlanResultSchema>;

export const researchContextSchema = z.object({
  topic: z.string().min(1),
  nodeTitle: z.string().min(1),
  rootTopic: z.string().min(1),
  parentTopic: z.string().optional(),
  siblingTopics: z.array(z.string()).default([]),
  targetAudience: z.string().default("estudiantes universitarios"),
  difficultyLevel: difficultySchema.default("intermediate"),
  learningObjective: z.string().optional(),
  additionalContext: z.string().optional(),
});
export type ResearchContext = z.infer<typeof researchContextSchema>;

export const researchSourceSchema = z.object({
  title: z.string(),
  url: z.string(),
  snippet: z.string(),
  content: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  relevanceScore: z.number().min(0).max(1).optional(),
});
export type ResearchSource = z.infer<typeof researchSourceSchema>;

export const researchSummarySchema = z.object({
  overview: z.string(),
  keyFindings: z.array(z.string()),
  keyConcepts: z.array(z.string()),
  contradictions: z.array(z.string()),
  suggestedSubtopics: z.array(z.string()),
  studyQuestions: z.array(z.string()),
  confidenceNotes: z.array(z.string()),
  recommendedSourceUrls: z.array(z.string()).default([]),
});
export type ResearchSummary = z.infer<typeof researchSummarySchema>;

export const qaResultSchema = z.object({
  isSufficient: z.boolean(),
  qualityScore: z.number().min(1).max(10),
  coverageScore: z.number().min(1).max(10),
  sourceQualityScore: z.number().min(1).max(10),
  clarityScore: z.number().min(1).max(10),
  gaps: z.array(z.string()),
  recommendations: z.array(z.string()),
  additionalQueries: z.array(z.string()).default([]),
  validationReport: z.string(),
});
export type QAResult = z.infer<typeof qaResultSchema>;

export const editorResultSchema = z.object({
  title: z.string(),
  shortSummary: z.string(),
  contentMarkdown: z.string(),
  learningObjective: z.string(),
  difficultyLevel: difficultySchema,
  keyConcepts: z.array(z.string()),
  studyQuestions: z.array(z.string()),
  sources: z.array(
    z.object({
      title: z.string(),
      url: z.string(),
    })
  ),
});
export type EditorResult = z.infer<typeof editorResultSchema>;

export interface ResearchResult {
  context: ResearchContext;
  query: string;
  sources: ResearchSource[];
  summary: ResearchSummary;
}

function getExpectedParentNumbering(numbering: string): string | null {
  const parts = numbering.split(".");
  if (parts.length === 1) return null;
  return parts.slice(0, -1).join(".");
}

function getDepthFromNumbering(numbering: string): number {
  return numbering.split(".").length;
}

export function validateNodePlanSemantics(plan: NodePlanResult): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const seen = new Set<string>();

  for (const node of plan.nodes) {
    if (seen.has(node.numbering)) {
      errors.push(`Numeración duplicada: ${node.numbering}`);
    }
    seen.add(node.numbering);

    const expectedParent = getExpectedParentNumbering(node.numbering);
    if (node.parentNumbering !== expectedParent) {
      errors.push(
        `parentNumbering inválido en ${node.numbering}. Esperado: ${
          expectedParent ?? "null"
        }, recibido: ${node.parentNumbering ?? "null"}`
      );
    }

    const expectedDepth = getDepthFromNumbering(node.numbering);
    if (node.depth !== expectedDepth) {
      errors.push(
        `depth inválido en ${node.numbering}. Esperado: ${expectedDepth}, recibido: ${node.depth}`
      );
    }

    if (!node.displayTitle.startsWith(`${node.numbering} `)) {
      errors.push(
        `displayTitle no comienza con la numeración correcta en ${node.numbering}`
      );
    }
  }

  for (const node of plan.nodes) {
    if (node.parentNumbering && !seen.has(node.parentNumbering)) {
      errors.push(
        `El nodo ${node.numbering} referencia un padre inexistente: ${node.parentNumbering}`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
