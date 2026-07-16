import type {
  MindMap,
  MapNode,
  MapEdge,
  MapCollaborator,
  InterviewSession,
  MapView,
  User,
  Visibility,
  MapStatus,
  CollaboratorRole,
} from '../domain/types';

export interface CreateMapInput {
  ownerId: string;
  title: string;
  description?: string;
  rootTopic: string;
  purpose?: string;
  audience?: string;
  knowledgeLevel?: string;
  depthPreference?: string;
  visibility?: Visibility;
  status?: MapStatus;
}

export interface UpdateMapInput {
  id: string;
  title?: string;
  description?: string;
  rootTopic?: string;
  purpose?: string;
  audience?: string;
  knowledgeLevel?: string;
  depthPreference?: string;
  visibility?: Visibility;
  status?: MapStatus;
  lastOpenedAt?: Date;
}

export interface MapAccessView {
  map: MindMap;
  role: CollaboratorRole | 'owner';
  isOwner: boolean;
}

export interface MapRepository {
  create(input: CreateMapInput): Promise<MindMap>;
  findById(id: string): Promise<MindMap | null>;
  findAccessibleMap(mapId: string, userId: string): Promise<MapAccessView | null>;
  findByOwnerId(ownerId: string): Promise<MindMap[]>;
  update(input: UpdateMapInput): Promise<MindMap>;
  updateVersion(id: string, expectedVersion: number): Promise<MindMap>;
  softDelete(id: string): Promise<void>;
}

export interface CreateNodeInput {
  mapId: string;
  parentNodeId?: string | null;
  createdBy: string;
  updatedBy: string;
  nodeType?: string;
  title: string;
  posX?: number;
  posY?: number;
}

export interface UpdateNodeContentInput {
  id: string;
  updatedBy: string;
  expectedVersion: number;
  title?: string;
  shortSummary?: string;
  contentMarkdown?: string;
  learningObjective?: string;
  difficultyLevel?: string;
  editorialStatus?: string;
}

export interface UpdateNodePositionInput {
  id: string;
  updatedBy: string;
  expectedVersion: number;
  posX: number;
  posY: number;
  isCollapsed?: boolean;
}

export interface NodeRepository {
  create(input: CreateNodeInput): Promise<MapNode>;
  findById(id: string): Promise<MapNode | null>;
  findByMapId(mapId: string): Promise<MapNode[]>;
  findRootByMapId(mapId: string): Promise<MapNode | null>;
  updateContent(input: UpdateNodeContentInput): Promise<MapNode>;
  updatePosition(input: UpdateNodePositionInput): Promise<MapNode>;
  incrementChildCount(id: string): Promise<void>;
  softDelete(id: string): Promise<void>;
}

export interface CreateEdgeInput {
  mapId: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationType?: string;
  label?: string;
  createdBy: string;
  updatedBy: string;
}

export interface EdgeRepository {
  create(input: CreateEdgeInput): Promise<MapEdge>;
  findById(id: string): Promise<MapEdge | null>;
  findByMapId(mapId: string): Promise<MapEdge[]>;
  delete(id: string): Promise<void>;
}

export interface CollaboratorRepository {
  findByMapId(mapId: string): Promise<MapCollaborator[]>;
  findUserRole(mapId: string, userId: string): Promise<CollaboratorRole | null>;
  addCollaborator(mapId: string, userId: string, role: CollaboratorRole, invitedBy: string): Promise<MapCollaborator>;
  updateRole(id: string, role: CollaboratorRole): Promise<MapCollaborator>;
  remove(mapId: string, userId: string): Promise<void>;
}

export interface InterviewRepository {
  create(ownerId: string): Promise<InterviewSession>;
  findById(id: string): Promise<InterviewSession | null>;
  findByOwnerId(ownerId: string): Promise<InterviewSession[]>;
  update(id: string, input: Partial<InterviewSession>): Promise<InterviewSession>;
  updateStatus(id: string, status: InterviewSession['status']): Promise<InterviewSession>;
  materialize(id: string, mapId: string): Promise<InterviewSession>;
}

export interface MapViewRepository {
  findByMapAndUser(mapId: string, userId: string): Promise<MapView | null>;
  upsert(mapId: string, userId: string, viewport: { x: number; y: number; zoom: number }, selectedNodeId?: string): Promise<MapView>;
}

export interface UserRepository {
  create(clerkUserId: string, email?: string, displayName?: string, avatarUrl?: string): Promise<User>;
  findByClerkUserId(clerkUserId: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  update(id: string, input: Partial<User>): Promise<User>;
}
