ALTER TABLE "map_edges" DROP CONSTRAINT "map_edges_unique";--> statement-breakpoint
ALTER TABLE "map_nodes" ADD COLUMN "position" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "map_nodes" ADD COLUMN "hierarchy_path" text;--> statement-breakpoint
ALTER TABLE "map_nodes" ADD COLUMN "depth" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
CREATE INDEX "map_nodes_map_id_parent_position_idx" ON "map_nodes" USING btree ("map_id","parent_node_id","position");--> statement-breakpoint
CREATE INDEX "map_nodes_hierarchy_path_idx" ON "map_nodes" USING btree ("map_id","hierarchy_path");