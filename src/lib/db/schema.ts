import { pgTable, uuid, text, timestamp, integer, numeric, boolean, unique, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkUserId: text('clerk_user_id').unique().notNull(),
  email: text('email'),
  displayName: text('display_name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const mindMaps = pgTable('mind_maps', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  rootTopic: text('root_topic').notNull(),
  purpose: text('purpose'),
  audience: text('audience'),
  knowledgeLevel: text('knowledge_level'),
  depthPreference: text('depth_preference'),
  visibility: text('visibility').notNull().default('private'),
  status: text('status').notNull().default('draft'),
  currentVersion: integer('current_version').notNull().default(1),
  settingsJson: text('settings_json'),
  lastOpenedAt: timestamp('last_opened_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => [
  index('mind_maps_owner_id_idx').on(table.ownerId),
  index('mind_maps_status_idx').on(table.status),
]);

export const mapViews = pgTable('map_views', {
  id: uuid('id').primaryKey().defaultRandom(),
  mapId: uuid('map_id').references(() => mindMaps.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  viewportX: numeric('viewport_x').notNull().default('0'),
  viewportY: numeric('viewport_y').notNull().default('0'),
  zoom: numeric('zoom').notNull().default('1'),
  selectedNodeId: uuid('selected_node_id'),
  panelState: text('panel_state'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('map_views_map_id_idx').on(table.mapId),
  unique('map_views_map_id_user_id_unique').on(table.mapId, table.userId),
]);

export const mapNodes = pgTable('map_nodes', {
  id: uuid('id').primaryKey().defaultRandom(),
  mapId: uuid('map_id').references(() => mindMaps.id).notNull(),
  parentNodeId: uuid('parent_node_id'),
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  updatedBy: uuid('updated_by').references(() => users.id).notNull(),
  nodeType: text('node_type').notNull().default('concept'),
  title: text('title').notNull(),
  slug: text('slug'),
  shortSummary: text('short_summary'),
  contentMarkdown: text('content_markdown'),
  contentJson: text('content_json'),
  learningObjective: text('learning_objective'),
  difficultyLevel: text('difficulty_level'),
  generationMode: text('generation_mode').notNull().default('manual'),
  editorialStatus: text('editorial_status').notNull().default('draft'),
  sourceCount: integer('source_count').notNull().default(0),
  childCount: integer('child_count').notNull().default(0),
  position: integer('position').notNull().default(0),
  hierarchyPath: text('hierarchy_path'),
  depth: integer('depth').notNull().default(1),
  posX: numeric('pos_x').notNull().default('0'),
  posY: numeric('pos_y').notNull().default('0'),
  width: numeric('width'),
  height: numeric('height'),
  isCollapsed: boolean('is_collapsed').notNull().default(false),
  version: integer('version').notNull().default(1),
  lastGeneratedAt: timestamp('last_generated_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => [
  index('map_nodes_map_id_idx').on(table.mapId),
  index('map_nodes_map_id_parent_idx').on(table.mapId, table.parentNodeId),
  index('map_nodes_map_id_type_idx').on(table.mapId, table.nodeType),
  index('map_nodes_map_id_parent_position_idx').on(table.mapId, table.parentNodeId, table.position),
  index('map_nodes_hierarchy_path_idx').on(table.mapId, table.hierarchyPath),
]);

export const mapEdges = pgTable('map_edges', {
  id: uuid('id').primaryKey().defaultRandom(),
  mapId: uuid('map_id').references(() => mindMaps.id).notNull(),
  sourceNodeId: uuid('source_node_id').references(() => mapNodes.id).notNull(),
  targetNodeId: uuid('target_node_id').references(() => mapNodes.id).notNull(),
  relationType: text('relation_type').notNull().default('structural'),
  label: text('label'),
  styleJson: text('style_json'),
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  updatedBy: uuid('updated_by').references(() => users.id).notNull(),
  version: integer('version').notNull().default(1),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('map_edges_map_id_idx').on(table.mapId),
]);

export const mapCollaborators = pgTable('map_collaborators', {
  id: uuid('id').primaryKey().defaultRandom(),
  mapId: uuid('map_id').references(() => mindMaps.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  role: text('role').notNull(),
  invitedBy: uuid('invited_by').references(() => users.id).notNull(),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  unique('map_collaborators_map_id_user_id_unique').on(table.mapId, table.userId),
]);

export const mapShareLinks = pgTable('map_share_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  mapId: uuid('map_id').references(() => mindMaps.id).notNull(),
  token: text('token').unique().notNull(),
  accessMode: text('access_mode').notNull().default('readonly'),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('map_share_links_map_id_idx').on(table.mapId),
]);

export const collaborationRequests = pgTable('collaboration_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  mapId: uuid('map_id').references(() => mindMaps.id).notNull(),
  requesterId: uuid('requester_id').references(() => users.id).notNull(),
  status: text('status').notNull().default('pending'),
  message: text('message'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('collaboration_requests_map_id_idx').on(table.mapId),
  index('collaboration_requests_requester_idx').on(table.requesterId),
  unique('collaboration_requests_map_requester_unique').on(table.mapId, table.requesterId),
]);

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  type: text('type').notNull(),
  title: text('title').notNull(),
  message: text('message'),
  link: text('link'),
  relatedId: uuid('related_id'),
  readAt: timestamp('read_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('notifications_user_id_idx').on(table.userId),
  index('notifications_user_read_idx').on(table.userId, table.readAt),
]);

export const interviewSessions = pgTable('interview_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id').references(() => users.id).notNull(),
  mapId: uuid('map_id').references(() => mindMaps.id),
  status: text('status').notNull().default('draft'),
  intentSummary: text('intent_summary'),
  topic: text('topic'),
  objective: text('objective'),
  audience: text('audience'),
  knowledgeLevel: text('knowledge_level'),
  depthPreference: text('depth_preference'),
  preferredSources: text('preferred_sources'),
  conversationJson: text('conversation_json'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('interview_sessions_owner_id_idx').on(table.ownerId),
  index('interview_sessions_map_id_idx').on(table.mapId),
]);

export const researchTasks = pgTable('research_tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  mapId: uuid('map_id').references(() => mindMaps.id).notNull(),
  nodeId: uuid('node_id').references(() => mapNodes.id),
  requestedBy: uuid('requested_by').references(() => users.id).notNull(),
  provider: text('provider').notNull(),
  status: text('status').notNull().default('queued'),
  queryText: text('query_text').notNull(),
  promptContext: text('prompt_context'),
  rawResultJson: text('raw_result_json'),
  normalizedResultJson: text('normalized_result_json'),
  errorMessage: text('error_message'),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('research_tasks_map_id_idx').on(table.mapId),
  index('research_tasks_status_idx').on(table.status),
]);

export const nodeSources = pgTable('node_sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  mapId: uuid('map_id').references(() => mindMaps.id).notNull(),
  nodeId: uuid('node_id').references(() => mapNodes.id).notNull(),
  researchTaskId: uuid('research_task_id').references(() => researchTasks.id),
  title: text('title').notNull(),
  url: text('url').notNull(),
  provider: text('provider').notNull(),
  snippet: text('snippet'),
  author: text('author'),
  domain: text('domain'),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  relevanceScore: numeric('relevance_score'),
  metadataJson: text('metadata_json'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('node_sources_map_id_idx').on(table.mapId),
  index('node_sources_node_id_idx').on(table.nodeId),
]);

export const generationTasks = pgTable('generation_tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  mapId: uuid('map_id').references(() => mindMaps.id).notNull(),
  nodeId: uuid('node_id').references(() => mapNodes.id),
  requestedBy: uuid('requested_by').references(() => users.id).notNull(),
  taskType: text('task_type').notNull(),
  provider: text('provider').notNull(),
  modelName: text('model_name').notNull(),
  status: text('status').notNull().default('queued'),
  promptText: text('prompt_text').notNull(),
  promptContext: text('prompt_context'),
  responseText: text('response_text'),
  responseJson: text('response_json'),
  tokenUsageJson: text('token_usage_json'),
  latencyMs: integer('latency_ms'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
}, (table) => [
  index('generation_tasks_map_id_idx').on(table.mapId),
  index('generation_tasks_status_idx').on(table.status),
]);

export const nodeRevisions = pgTable('node_revisions', {
  id: uuid('id').primaryKey().defaultRandom(),
  nodeId: uuid('node_id').references(() => mapNodes.id).notNull(),
  mapId: uuid('map_id').references(() => mindMaps.id).notNull(),
  versionNumber: integer('version_number').notNull(),
  title: text('title').notNull(),
  shortSummary: text('short_summary'),
  contentMarkdown: text('content_markdown'),
  generationMode: text('generation_mode').notNull(),
  editorialStatus: text('editorial_status').notNull(),
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  sourceTaskId: uuid('source_task_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('node_revisions_node_id_idx').on(table.nodeId),
]);

export const domainEvents = pgTable('domain_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  aggregateType: text('aggregate_type').notNull(),
  aggregateId: uuid('aggregate_id').notNull(),
  mapId: uuid('map_id').references(() => mindMaps.id),
  actorUserId: uuid('actor_user_id').references(() => users.id),
  eventType: text('event_type').notNull(),
  payloadJson: text('payload_json').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('domain_events_aggregate_idx').on(table.aggregateType, table.aggregateId),
  index('domain_events_map_id_idx').on(table.mapId),
]);

export const usersRelations = relations(users, ({ many }) => ({
  ownedMaps: many(mindMaps),
  collaborations: many(mapCollaborators),
  interviewSessions: many(interviewSessions),
}));

export const mindMapsRelations = relations(mindMaps, ({ one, many }) => ({
  owner: one(users, {
    fields: [mindMaps.ownerId],
    references: [users.id],
  }),
  nodes: many(mapNodes),
  edges: many(mapEdges),
  collaborators: many(mapCollaborators),
  views: many(mapViews),
  interviewSessions: many(interviewSessions),
  researchTasks: many(researchTasks),
  generationTasks: many(generationTasks),
}));

export const mapNodesRelations = relations(mapNodes, ({ one, many }) => ({
  map: one(mindMaps, {
    fields: [mapNodes.mapId],
    references: [mindMaps.id],
  }),
  parent: one(mapNodes, {
    fields: [mapNodes.parentNodeId],
    references: [mapNodes.id],
    relationName: 'parentChild',
  }),
  children: many(mapNodes, { relationName: 'parentChild' }),
  createdByUser: one(users, {
    fields: [mapNodes.createdBy],
    references: [users.id],
  }),
  updatedByUser: one(users, {
    fields: [mapNodes.updatedBy],
    references: [users.id],
  }),
  sources: many(nodeSources),
  revisions: many(nodeRevisions),
  incomingEdges: many(mapEdges, { relationName: 'targetNode' }),
  outgoingEdges: many(mapEdges, { relationName: 'sourceNode' }),
}));

export const mapEdgesRelations = relations(mapEdges, ({ one }) => ({
  map: one(mindMaps, {
    fields: [mapEdges.mapId],
    references: [mindMaps.id],
  }),
  sourceNode: one(mapNodes, {
    fields: [mapEdges.sourceNodeId],
    references: [mapNodes.id],
    relationName: 'sourceNode',
  }),
  targetNode: one(mapNodes, {
    fields: [mapEdges.targetNodeId],
    references: [mapNodes.id],
    relationName: 'targetNode',
  }),
  createdByUser: one(users, {
    fields: [mapEdges.createdBy],
    references: [users.id],
  }),
  updatedByUser: one(users, {
    fields: [mapEdges.updatedBy],
    references: [users.id],
  }),
}));

export const mapCollaboratorsRelations = relations(mapCollaborators, ({ one }) => ({
  map: one(mindMaps, {
    fields: [mapCollaborators.mapId],
    references: [mindMaps.id],
  }),
  user: one(users, {
    fields: [mapCollaborators.userId],
    references: [users.id],
  }),
  inviter: one(users, {
    fields: [mapCollaborators.invitedBy],
    references: [users.id],
  }),
}));

export const interviewSessionsRelations = relations(interviewSessions, ({ one }) => ({
  owner: one(users, {
    fields: [interviewSessions.ownerId],
    references: [users.id],
  }),
  map: one(mindMaps, {
    fields: [interviewSessions.mapId],
    references: [mindMaps.id],
  }),
}));

export const researchTasksRelations = relations(researchTasks, ({ one }) => ({
  map: one(mindMaps, {
    fields: [researchTasks.mapId],
    references: [mindMaps.id],
  }),
  node: one(mapNodes, {
    fields: [researchTasks.nodeId],
    references: [mapNodes.id],
  }),
  requester: one(users, {
    fields: [researchTasks.requestedBy],
    references: [users.id],
  }),
}));

export const nodeSourcesRelations = relations(nodeSources, ({ one }) => ({
  map: one(mindMaps, {
    fields: [nodeSources.mapId],
    references: [mindMaps.id],
  }),
  node: one(mapNodes, {
    fields: [nodeSources.nodeId],
    references: [mapNodes.id],
  }),
  researchTask: one(researchTasks, {
    fields: [nodeSources.researchTaskId],
    references: [researchTasks.id],
  }),
}));

export const generationTasksRelations = relations(generationTasks, ({ one }) => ({
  map: one(mindMaps, {
    fields: [generationTasks.mapId],
    references: [mindMaps.id],
  }),
  node: one(mapNodes, {
    fields: [generationTasks.nodeId],
    references: [mapNodes.id],
  }),
  requester: one(users, {
    fields: [generationTasks.requestedBy],
    references: [users.id],
  }),
}));

export const nodeRevisionsRelations = relations(nodeRevisions, ({ one }) => ({
  node: one(mapNodes, {
    fields: [nodeRevisions.nodeId],
    references: [mapNodes.id],
  }),
  map: one(mindMaps, {
    fields: [nodeRevisions.mapId],
    references: [mindMaps.id],
  }),
  createdByUser: one(users, {
    fields: [nodeRevisions.createdBy],
    references: [users.id],
  }),
}));

export const domainEventsRelations = relations(domainEvents, ({ one }) => ({
  map: one(mindMaps, {
    fields: [domainEvents.mapId],
    references: [mindMaps.id],
  }),
  actor: one(users, {
    fields: [domainEvents.actorUserId],
    references: [users.id],
  }),
}));
