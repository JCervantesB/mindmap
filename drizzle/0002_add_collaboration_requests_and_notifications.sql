CREATE TABLE "collaboration_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"map_id" uuid NOT NULL,
	"requester_id" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "collaboration_requests_map_requester_unique" UNIQUE("map_id","requester_id")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text,
	"link" text,
	"related_id" uuid,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "collaboration_requests" ADD CONSTRAINT "collaboration_requests_map_id_mind_maps_id_fk" FOREIGN KEY ("map_id") REFERENCES "public"."mind_maps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_requests" ADD CONSTRAINT "collaboration_requests_requester_id_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "collaboration_requests_map_id_idx" ON "collaboration_requests" USING btree ("map_id");--> statement-breakpoint
CREATE INDEX "collaboration_requests_requester_idx" ON "collaboration_requests" USING btree ("requester_id");--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_user_read_idx" ON "notifications" USING btree ("user_id","read_at");