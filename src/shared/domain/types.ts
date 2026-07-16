export type Visibility = 'private' | 'shared' | 'link_readonly';
export type MapStatus = 'draft' | 'active' | 'archived';
export type NodeType = 'root' | 'concept' | 'subtopic' | 'question' | 'example' | 'source';
export type GenerationMode = 'manual' | 'generated' | 'mixed';
export type EditorialStatus = 'draft' | 'reviewed' | 'approved';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type DepthPreference = 'shallow' | 'medium' | 'deep';
export type Purpose = 'study' | 'teach' | 'research' | 'document';
export type RelationType = 'structural' | 'related' | 'causal' | 'comparative' | 'prerequisite';
export type CollaboratorRole = 'owner' | 'editor' | 'commenter' | 'viewer';
export type InterviewStatus = 'draft' | 'completed' | 'abandoned' | 'materialized';
export type ResearchStatus = 'queued' | 'running' | 'completed' | 'failed' | 'canceled';
export type GenerationStatus = 'queued' | 'running' | 'streamed' | 'completed' | 'failed' | 'canceled';
export type TaskType = 'initial_map' | 'node_content' | 'node_expansion' | 'node_questions' | 'rewrite';

export interface User {
  id: string;
  clerkUserId: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MindMap {
  id: string;
  ownerId: string;
  title: string;
  description: string | null;
  rootTopic: string;
  purpose: Purpose | null;
  audience: string | null;
  knowledgeLevel: DifficultyLevel | null;
  depthPreference: DepthPreference | null;
  visibility: Visibility;
  status: MapStatus;
  currentVersion: number;
  settingsJson: string | null;
  lastOpenedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface MapNode {
  id: string;
  mapId: string;
  parentNodeId: string | null;
  createdBy: string;
  updatedBy: string;
  nodeType: NodeType;
  title: string;
  slug: string | null;
  shortSummary: string | null;
  contentMarkdown: string | null;
  contentJson: string | null;
  learningObjective: string | null;
  difficultyLevel: DifficultyLevel | null;
  generationMode: GenerationMode;
  editorialStatus: EditorialStatus;
  sourceCount: number;
  childCount: number;
  position: number;
  posX: number;
  posY: number;
  width: number | null;
  height: number | null;
  isCollapsed: boolean;
  version: number;
  lastGeneratedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface MapEdge {
  id: string;
  mapId: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationType: RelationType;
  label: string | null;
  styleJson: string | null;
  createdBy: string;
  updatedBy: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MapCollaborator {
  id: string;
  mapId: string;
  userId: string;
  role: CollaboratorRole;
  invitedBy: string;
  acceptedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MapShareLink {
  id: string;
  mapId: string;
  token: string;
  accessMode: 'readonly';
  expiresAt: Date | null;
  revokedAt: Date | null;
  createdBy: string;
  createdAt: Date;
}

export interface InterviewSession {
  id: string;
  ownerId: string;
  mapId: string | null;
  status: InterviewStatus;
  intentSummary: string | null;
  topic: string | null;
  objective: Purpose | null;
  audience: string | null;
  knowledgeLevel: DifficultyLevel | null;
  depthPreference: DepthPreference | null;
  preferredSources: string[] | null;
  conversationJson: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MapView {
  id: string;
  mapId: string;
  userId: string;
  viewportX: number;
  viewportY: number;
  zoom: number;
  selectedNodeId: string | null;
  panelState: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DomainEvent {
  id: string;
  aggregateType: 'map' | 'node' | 'edge' | 'collaborator' | 'interview';
  aggregateId: string;
  mapId: string | null;
  actorUserId: string | null;
  eventType: string;
  payloadJson: string;
  createdAt: Date;
}
