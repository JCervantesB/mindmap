export interface InterviewContext {
  topic: string;
  objective: string;
  audience: string;
  knowledgeLevel: string;
  depthPreference: string;
}

export interface InterviewContextOld {
  topic: string;
  objective: "study" | "teach" | "research" | "document";
  knowledgeLevel: "beginner" | "intermediate" | "advanced";
  targetAudience: string;
  depthLevel: "superficial" | "medium" | "deep";
  preferredSources: string[];
}
