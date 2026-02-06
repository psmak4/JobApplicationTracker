CREATE TABLE "calendar_events" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text NOT NULL,
	"google_event_id" text,
	"title" text NOT NULL,
	"url" text,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "calendar_events_application_id_idx" ON "calendar_events" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "calendar_events_start_time_idx" ON "calendar_events" USING btree ("start_time");--> statement-breakpoint
ALTER TABLE "status_history" DROP COLUMN "event_id";--> statement-breakpoint
ALTER TABLE "status_history" DROP COLUMN "event_title";--> statement-breakpoint
ALTER TABLE "status_history" DROP COLUMN "event_url";--> statement-breakpoint
ALTER TABLE "status_history" DROP COLUMN "event_start_time";--> statement-breakpoint
ALTER TABLE "status_history" DROP COLUMN "event_end_time";