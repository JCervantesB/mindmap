import { describe, it, expect } from "vitest";
import {
  nodePlanResultSchema,
  plannedNodeSchema,
  researchSummarySchema,
  validateNodePlanSemantics,
  type NodePlanResult,
} from "./schemas";

describe("plannedNodeSchema", () => {
  it("parses a valid node", () => {
    const result = plannedNodeSchema.safeParse({
      id: "n1",
      numbering: "1.1",
      parentNumbering: "1",
      depth: 2,
      title: "Fundamentos",
      displayTitle: "1.1 Fundamentos",
      nodeType: "concept",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid numbering", () => {
    const result = plannedNodeSchema.safeParse({
      id: "n1",
      numbering: "1..1",
      parentNumbering: "1",
      depth: 2,
      title: "Fundamentos",
      displayTitle: "1.1 Fundamentos",
      nodeType: "concept",
    });
    expect(result.success).toBe(false);
  });

  it("rejects depth out of range", () => {
    const result = plannedNodeSchema.safeParse({
      id: "n1",
      numbering: "1.1",
      parentNumbering: "1",
      depth: 7,
      title: "Fundamentos",
      displayTitle: "1.1 Fundamentos",
      nodeType: "concept",
    });
    expect(result.success).toBe(false);
  });
});

describe("nodePlanResultSchema", () => {
  it("rejects an empty node list", () => {
    const result = nodePlanResultSchema.safeParse({
      rootTitle: "Tema",
      mapGoal: "estudiar",
      organizationStrategy: "foundations-first",
      criticalConcepts: ["concepto"],
      nodes: [],
    });
    expect(result.success).toBe(false);
  });
});

describe("validateNodePlanSemantics", () => {
  const validPlan: NodePlanResult = {
    rootTitle: "Redes neuronales",
    mapGoal: "estudiar",
    organizationStrategy: "foundations-first",
    criticalConcepts: ["neurona"],
    nodes: [
      {
        id: "n1",
        numbering: "1",
        parentNumbering: null,
        depth: 1,
        title: "Fundamentos",
        displayTitle: "1 Fundamentos",
        nodeType: "concept",
      },
      {
        id: "n2",
        numbering: "1.1",
        parentNumbering: "1",
        depth: 2,
        title: "Perceptrón",
        displayTitle: "1.1 Perceptrón",
        nodeType: "concept",
      },
      {
        id: "n3",
        numbering: "2",
        parentNumbering: null,
        depth: 1,
        title: "Arquitecturas",
        displayTitle: "2 Arquitecturas",
        nodeType: "concept",
      },
    ],
  };

  it("accepts a semantically correct plan", () => {
    const result = validateNodePlanSemantics(validPlan);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects duplicate numbering", () => {
    const plan = structuredClone(validPlan);
    plan.nodes[0].numbering = "2";
    const result = validateNodePlanSemantics(plan);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("duplicada"))).toBe(true);
  });

  it("rejects wrong parentNumbering", () => {
    const plan = structuredClone(validPlan);
    plan.nodes[1].parentNumbering = "9";
    const result = validateNodePlanSemantics(plan);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("parentNumbering inválido"))).toBe(true);
  });

  it("rejects wrong depth", () => {
    const plan = structuredClone(validPlan);
    plan.nodes[1].depth = 3;
    const result = validateNodePlanSemantics(plan);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("depth inválido"))).toBe(true);
  });

  it("rejects a parent that does not exist", () => {
    const plan = structuredClone(validPlan);
    plan.nodes[0].parentNumbering = "5";
    plan.nodes[0].displayTitle = "1 Fundamentos";
    const result = validateNodePlanSemantics(plan);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("padre inexistente"))).toBe(true);
  });
});

describe("researchSummarySchema", () => {
  it("parses a valid summary", () => {
    const result = researchSummarySchema.safeParse({
      overview: "Resumen del tema",
      keyFindings: ["hallazgo"],
      keyConcepts: ["concepto"],
      contradictions: [],
      suggestedSubtopics: ["subtema"],
      studyQuestions: ["pregunta"],
      confidenceNotes: ["nota"],
      recommendedSourceUrls: ["https://example.com"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing keyFindings", () => {
    const result = researchSummarySchema.safeParse({
      overview: "Resumen del tema",
      keyConcepts: ["concepto"],
      contradictions: [],
      suggestedSubtopics: [],
      studyQuestions: [],
      confidenceNotes: [],
    });
    expect(result.success).toBe(false);
  });
});