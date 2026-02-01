ALTER TABLE "status_history" ADD COLUMN "event_id" text;--> statement-breakpoint
ALTER TABLE "status_history" ADD COLUMN "event_title" text;--> statement-breakpoint
ALTER TABLE "status_history" ADD COLUMN "event_url" text;--> statement-breakpoint
ALTER TABLE "status_history" ADD COLUMN "event_start_time" timestamp;--> statement-breakpoint
ALTER TABLE "status_history" ADD COLUMN "event_end_time" timestamp;