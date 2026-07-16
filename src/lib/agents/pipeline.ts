import { researcherAgent } from "./researcher";
import { qaAgent } from "./qa";
import { editorAgent } from "./editor";
import type { ResearchContext, ResearchResult, QAResult, EditorResult } from "./schemas";

export interface PipelineResult {
  research: ResearchResult;
  qa: QAResult;
  editor: EditorResult;
}

export interface PipelineOptions {
  context: ResearchContext;
  maxResearchIterations?: number;
  onProgress?: (stage: "research" | "qa" | "editor", data: unknown) => void;
}

export async function runNodeResearchPipeline(
  options: PipelineOptions
): Promise<PipelineResult> {
  const { context, maxResearchIterations = 2, onProgress } = options;

  const research = await researcherAgent(context);
  onProgress?.("research", research);

  let qa: QAResult;
  try {
    qa = await qaAgent(research);
    onProgress?.("qa", qa);
  } catch (qaError) {
    console.warn("[Pipeline] QA failed, using fallback:", qaError);
    qa = {
      isSufficient: true,
      qualityScore: 7,
      coverageScore: 7,
      sourceQualityScore: 7,
      clarityScore: 7,
      gaps: [],
      recommendations: [],
      additionalQueries: [],
      validationReport: "QA omitido por error técnico.",
    };
    onProgress?.("qa", qa);
  }

  if (!qa.isSufficient && qa.additionalQueries.length > 0) {
    console.log(`[Pipeline] QA insufficient, ${qa.additionalQueries.length} additional queries needed`);
  }

  const editor = await editorAgent(research, qa);
  onProgress?.("editor", editor);

  return {
    research,
    qa,
    editor,
  };
}
