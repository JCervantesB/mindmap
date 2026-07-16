CREATE TABLE "domain_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aggregate_type" text NOT NULL,
	"aggregate_id" uuid NOT NULL,
	"map_id" uuid,
	"actor_user_id" uuid,
	"event_type" text NOT NULL,
	"payload_json" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generation_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"map_id" uuid NOT NULL,
	"node_id" uuid,
	"requested_by" uuid NOT NULL,
	"task_type" text NOT NULL,
	"provider" text NOT NULL,
	"model_name" text NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"prompt_text" text NOT NULL,
	"prompt_context" text,
	"response_text" text,
	"response_json" text,
	"token_usage_json" text,
	"latency_ms" integer,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "interview_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"map_id" uuid,
	"status" text DEFAULT 'draft' NOT NULL,
	"intent_summary" text,
	"topic" text,
	"objective" text,
	"audience" text,
	"knowledge_level" text,
	"depth_preference" text,
	"preferred_sources" text,
	"conversation_json" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "map_collaborators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"map_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text NOT NULL,
	"invited_by" uuid NOT NULL,
	"accepted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "map_collaborators_map_id_user_id_unique" UNIQUE("map_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "map_edges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"map_id" uuid NOT NULL,
	"source_node_id" uuid NOT NULL,
	"target_node_id" uuid NOT NULL,
	"relation_type" text DEFAULT 'structural' NOT NULL,
	"label" text,
	"style_json" text,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "map_edges_unique" UNIQUE("map_id","source_node_id","target_node_id","relation_type")
);
--> statement-breakpoint
CREATE TABLE "map_nodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"map_id" uuid NOT NULL,
	"parent_node_id" uuid,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL,
	"node_type" text DEFAULT 'concept' NOT NULL,
	"title" text NOT NULL,
	"slug" text,
	"short_summary" text,
	"content_markdown" text,
	"content_json" text,
	"learning_objective" text,
	"difficulty_level" text,
	"generation_mode" text DEFAULT 'manual' NOT NULL,
	"editorial_status" text DEFAULT 'draft' NOT NULL,
	"source_count" integer DEFAULT 0 NOT NULL,
	"child_count" integer DEFAULT 0 NOT NULL,
	"pos_x" numeric DEFAULT '0' NOT NULL,
	"pos_y" numeric DEFAULT '0' NOT NULL,
	"width" numeric,
	"height" numeric,
	"is_collapsed" boolean DEFAULT false NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"last_generated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "map_share_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"map_id" uuid NOT NULL,
	"token" text NOT NULL,
	"access_mode" text DEFAULT 'readonly' NOT NULL,
	"expires_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "map_share_links_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "map_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"map_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"viewport_x" numeric DEFAULT '0' NOT NULL,
	"viewport_y" numeric DEFAULT '0' NOT NULL,
	"zoom" numeric DEFAULT '1' NOT NULL,
	"selected_node_id" uuid,
	"panel_state" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "map_views_map_id_user_id_unique" UNIQUE("map_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "mind_maps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"root_topic" text NOT NULL,
	"purpose" text,
	"audience" text,
	"knowledge_level" text,
	"depth_preference" text,
	"visibility" text DEFAULT 'private' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"current_version" integer DEFAULT 1 NOT NULL,
	"settings_json" text,
	"last_opened_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "node_revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"node_id" uuid NOT NULL,
	"map_id" uuid NOT NULL,
	"version_number" integer NOT NULL,
	"title" text NOT NULL,
	"short_summary" text,
	"content_markdown" text,
	"generation_mode" text NOT NULL,
	"editorial_status" text NOT NULL,
	"created_by" uuid NOT NULL,
	"source_task_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "node_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"map_id" uuid NOT NULL,
	"node_id" uuid NOT NULL,
	"research_task_id" uuid,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"provider" text NOT NULL,
	"snippet" text,
	"author" text,
	"domain" text,
	"published_at" timestamp with time zone,
	"relevance_score" numeric,
	"metadata_json" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "research_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"map_id" uuid NOT NULL,
	"node_id" uuid,
	"requested_by" uuid NOT NULL,
	"provider" text NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"query_text" text NOT NULL,
	"prompt_context" text,
	"raw_result_json" text,
	"normalized_result_json" text,
	"error_message" text,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" text NOT NULL,
	"email" text,
	"display_name" text,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_user_id_unique" UNIQUE("clerk_user_id")
);
--> statement-breakpoint
ALTER TABLE "domain_events" ADD CONSTRAINT "domain_events_map_id_mind_maps_id_fk" FOREIGN KEY ("map_id") REFERENCES "public"."mind_maps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain_events" ADD CONSTRAINT "domain_events_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generation_tasks" ADD CONSTRAINT "generation_tasks_map_id_mind_maps_id_fk" FOREIGN KEY ("map_id") REFERENCES "public"."mind_maps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generation_tasks" ADD CONSTRAINT "generation_tasks_node_id_map_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."map_nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generation_tasks" ADD CONSTRAINT "generation_tasks_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_sessions" ADD CONSTRAINT "interview_sessions_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_sessions" ADD CONSTRAINT "interview_sessions_map_id_mind_maps_id_fk" FOREIGN KEY ("map_id") REFERENCES "public"."mind_maps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "map_collaborators" ADD CONSTRAINT "map_collaborators_map_id_mind_maps_id_fk" FOREIGN KEY ("map_id") REFERENCES "public"."mind_maps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "map_collaborators" ADD CONSTRAINT "map_collaborators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "map_collaborators" ADD CONSTRAINT "map_collaborators_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "map_edges" ADD CONSTRAINT "map_edges_map_id_mind_maps_id_fk" FOREIGN KEY ("map_id") REFERENCES "public"."mind_maps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "map_edges" ADD CONSTRAINT "map_edges_source_node_id_map_nodes_id_fk" FOREIGN KEY ("source_node_id") REFERENCES "public"."map_nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "map_edges" ADD CONSTRAINT "map_edges_target_node_id_map_nodes_id_fk" FOREIGN KEY ("target_node_id") REFERENCES "public"."map_nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "map_edges" ADD CONSTRAINT "map_edges_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "map_edges" ADD CONSTRAINT "map_edges_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "map_nodes" ADD CONSTRAINT "map_nodes_map_id_mind_maps_id_fk" FOREIGN KEY ("map_id") REFERENCES "public"."mind_maps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "map_nodes" ADD CONSTRAINT "map_nodes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "map_nodes" ADD CONSTRAINT "map_nodes_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "map_share_links" ADD CONSTRAINT "map_share_links_map_id_mind_maps_id_fk" FOREIGN KEY ("map_id") REFERENCES "public"."mind_maps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "map_share_links" ADD CONSTRAINT "map_share_links_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "map_views" ADD CONSTRAINT "map_views_map_id_mind_maps_id_fk" FOREIGN KEY ("map_id") REFERENCES "public"."mind_maps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "map_views" ADD CONSTRAINT "map_views_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mind_maps" ADD CONSTRAINT "mind_maps_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "node_revisions" ADD CONSTRAINT "node_revisions_node_id_map_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."map_nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "node_revisions" ADD CONSTRAINT "node_revisions_map_id_mind_maps_id_fk" FOREIGN KEY ("map_id") REFERENCES "public"."mind_maps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "node_revisions" ADD CONSTRAINT "node_revisions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "node_sources" ADD CONSTRAINT "node_sources_map_id_mind_maps_id_fk" FOREIGN KEY ("map_id") REFERENCES "public"."mind_maps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "node_sources" ADD CONSTRAINT "node_sources_node_id_map_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."map_nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "node_sources" ADD CONSTRAINT "node_sources_research_task_id_research_tasks_id_fk" FOREIGN KEY ("research_task_id") REFERENCES "public"."research_tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_tasks" ADD CONSTRAINT "research_tasks_map_id_mind_maps_id_fk" FOREIGN KEY ("map_id") REFERENCES "public"."mind_maps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_tasks" ADD CONSTRAINT "research_tasks_node_id_map_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."map_nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_tasks" ADD CONSTRAINT "research_tasks_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "domain_events_aggregate_idx" ON "domain_events" USING btree ("aggregate_type","aggregate_id");--> statement-breakpoint
CREATE INDEX "domain_events_map_id_idx" ON "domain_events" USING btree ("map_id");--> statement-breakpoint
CREATE INDEX "generation_tasks_map_id_idx" ON "generation_tasks" USING btree ("map_id");--> statement-breakpoint
CREATE INDEX "generation_tasks_status_idx" ON "generation_tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "interview_sessions_owner_id_idx" ON "interview_sessions" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "interview_sessions_map_id_idx" ON "interview_sessions" USING btree ("map_id");--> statement-breakpoint
CREATE INDEX "map_edges_map_id_idx" ON "map_edges" USING btree ("map_id");--> statement-breakpoint
CREATE INDEX "map_nodes_map_id_idx" ON "map_nodes" USING btree ("map_id");--> statement-breakpoint
CREATE INDEX "map_nodes_map_id_parent_idx" ON "map_nodes" USING btree ("map_id","parent_node_id");--> statement-breakpoint
CREATE INDEX "map_nodes_map_id_type_idx" ON "map_nodes" USING btree ("map_id","node_type");--> statement-breakpoint
CREATE INDEX "map_share_links_map_id_idx" ON "map_share_links" USING btree ("map_id");--> statement-breakpoint
CREATE INDEX "map_views_map_id_idx" ON "map_views" USING btree ("map_id");--> statement-breakpoint
CREATE INDEX "mind_maps_owner_id_idx" ON "mind_maps" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "mind_maps_status_idx" ON "mind_maps" USING btree ("status");--> statement-breakpoint
CREATE INDEX "node_revisions_node_id_idx" ON "node_revisions" USING btree ("node_id");--> statement-breakpoint
CREATE INDEX "node_sources_map_id_idx" ON "node_sources" USING btree ("map_id");--> statement-breakpoint
CREATE INDEX "node_sources_node_id_idx" ON "node_sources" USING btree ("node_id");--> statement-breakpoint
CREATE INDEX "research_tasks_map_id_idx" ON "research_tasks" USING btree ("map_id");--> statement-breakpoint
CREATE INDEX "research_tasks_status_idx" ON "research_tasks" USING btree ("status");