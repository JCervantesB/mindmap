import type { NodeType, ContentState, MapRole, DifficultyLevel } from "@/lib/constants";

export interface User {
  id: string;
  clerkUserId: string;
  email: string;
  name?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MindMap {
  id: string;
  ownerId: string;
  title: string;
  description?: string;
  rootTopic: string;
  visibility: "private" | "link_readonly" | "link_editable";
  viewportState?: ViewportState;
  settings?: MapSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface ViewportState {
  x: number;
  y: number;
  zoom: number;
}

export interface MapSettings {
  autoSave: boolean;
  showMinimap: boolean;
  showToolbar: boolean;
}

export interface MindMapNode {
  id: string;
  mapId: string;
  parentNodeId?: string;
  title: string;
  shortSummary?: string;
  content?: string;
  nodeType: NodeType;
  learningObjective?: string;
  difficultyLevel?: DifficultyLevel;
  contentState: ContentState;
  positionX: number;
  positionY: number;
  visualMetadata?: NodeVisualMetadata;
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NodeVisualMetadata {
  width?: number;
  height?: number;
  collapsed?: boolean;
  colorOverride?: string;
}

export interface MindMapEdge {
  id: string;
  mapId: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationType?: "structural" | "thematic" | "causal" | "comparative";
  label?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResearchTask {
  id: string;
  mapId: string;
  nodeId?: string;
  requestedBy: string;
  provider: "exa" | "openrouter";
  promptContext: string;
  status: "pending" | "processing" | "completed" | "failed";
  rawResult?: string;
  normalizedResult?: ResearchResult;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface ResearchResult {
  summary: string;
  sources: ResearchSource[];
  suggestions?: string[];
}

export interface ResearchSource {
  id: string;
  title: string;
  url: string;
  snippet: string;
  relevanceScore?: number;
  metadata?: {
    publishedDate?: string;
    author?: string;
    domain?: string;
  };
}

export interface NodeSource {
  id: string;
  mapId: string;
  nodeId: string;
  researchTaskId?: string;
  title: string;
  url?: string;
  provider?: "web" | "document" | "ai_generated" | "research" | "user_note";
  snippet?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface MapCollaborator {
  id: string;
  mapId: string;
  userId: string;
  role: MapRole;
  invitedBy: string;
  createdAt: Date;
}

export interface InterviewContext {
  topic?: string;
  objective?: "study" | "teach" | "research" | "document";
  knowledgeLevel?: "beginner" | "intermediate" | "advanced";
  targetAudience?: string;
  depthLevel?: "superficial" | "medium" | "deep";
  preferredSources?: string[];
  isComplete: boolean;
}

export interface NodeVersion {
  id: string;
  nodeId: string;
  version: number;
  content: string;
  contentState: ContentState;
  createdBy: "user" | "ai";
  createdAt: Date;
  createdByUserId?: string;
  modelUsed?: string;
  promptContext?: string;
  isCurrent: boolean;
}

export interface Comment {
  id: string;
  mapId: string;
  nodeId?: string;
  userId: string;
  content: string;
  resolved: boolean;
  parentCommentId?: string;
  createdAt: Date;
  updatedAt: Date;
}
