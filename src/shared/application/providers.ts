import type { User } from '../domain/types';
import type { CollaboratorRole } from '../domain/types';

export interface AuthenticatedUser {
  id: string;
  clerkUserId: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface CurrentUserProvider {
  getCurrentUser(): Promise<AuthenticatedUser | null>;
  requireCurrentUser(): Promise<AuthenticatedUser>;
}

export type ResourceType = 'map' | 'node' | 'edge' | 'collaborator' | 'interview';
export type DomainAction =
  | 'map.read'
  | 'map.update'
  | 'map.delete'
  | 'map.share'
  | 'map.manage_collaborators'
  | 'node.create'
  | 'node.update'
  | 'node.delete'
  | 'edge.create'
  | 'edge.delete'
  | 'research.run'
  | 'generation.run';

export interface ResourceRef {
  type: ResourceType;
  id: string;
  ownerId?: string;
}

export interface PermissionEvaluator {
  getRole(userId: string, resource: ResourceRef): Promise<CollaboratorRole | 'owner' | null>;
  ensureCan(userId: string, action: DomainAction, resource: ResourceRef): Promise<void>;
  can(userId: string, action: DomainAction, resource: ResourceRef): Promise<boolean>;
}

export interface TextGenerationProvider {
  generateText(input: {
    prompt: string;
    system?: string;
    model?: string;
  }): Promise<{ text: string; usage?: Record<string, number> }>;

  streamText(input: {
    prompt: string;
    system?: string;
    model?: string;
  }): Promise<ReadableStream<string>>;
}

export interface ResearchProvider {
  search(input: {
    query: string;
    maxResults?: number;
    type?: 'news' | 'papers' | 'auto';
  }): Promise<ResearchResult>;
}

export interface ResearchResult {
  results: Array<{
    id: string;
    title: string;
    url: string;
    snippet?: string;
    author?: string;
    publishedAt?: Date;
    domain?: string;
    score?: number;
  }>;
}

export interface AIGenerationProvider {
  generateStructure(input: {
    topic: string;
    purpose: string;
    audience: string;
    knowledgeLevel: string;
    depthPreference: string;
  }): Promise<GeneratedStructure>;

  generateContent(input: {
    nodeTitle: string;
    parentContext?: string;
    siblingTopics?: string[];
    purpose: string;
    audience: string;
  }): Promise<GeneratedContent>;

  expandNode(input: {
    nodeId: string;
    nodeTitle: string;
    mapContext: string;
  }): Promise<GeneratedExpansion>;
}

export interface GeneratedStructure {
  rootNode: {
    title: string;
    shortSummary?: string;
  };
  childNodes: Array<{
    title: string;
    shortSummary?: string;
    nodeType?: string;
  }>;
}

export interface GeneratedContent {
  title: string;
  shortSummary?: string;
  contentMarkdown: string;
  learningObjective?: string;
}

export interface GeneratedExpansion {
  newNodes: Array<{
    title: string;
    shortSummary?: string;
    nodeType?: string;
    parentNodeId?: string;
  }>;
  newEdges: Array<{
    sourceNodeId: string;
    targetNodeId: string;
    relationType?: string;
  }>;
}
