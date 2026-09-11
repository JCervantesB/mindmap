import { describe, it, expect } from "vitest";
import { MAP_TEMPLATES } from "./templates";

describe("MAP_TEMPLATES", () => {
  it("has unique template ids", () => {
    const ids = MAP_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has at least one node per template", () => {
    for (const template of MAP_TEMPLATES) {
      expect(template.nodes.length).toBeGreaterThan(0);
    }
  });

  it("uses valid node types", () => {
    const validTypes = ["root", "concept", "subtopic", "question", "example", "source"];
    for (const template of MAP_TEMPLATES) {
      for (const node of template.nodes) {
        expect(validTypes).toContain(node.nodeType);
      }
    }
  });

  it("has correct depths relative to numbering", () => {
    for (const template of MAP_TEMPLATES) {
      for (const node of template.nodes) {
        expect(node.depth).toBe(node.hierarchyPath.split(".").length);
      }
    }
  });
});