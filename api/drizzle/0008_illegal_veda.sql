ALTER TYPE "public"."application_status" ADD VALUE 'Offer Accepted' BEFORE 'Rejected';--> statement-breakpoint
ALTER TYPE "public"."application_status" ADD VALUE 'Offer Declined' BEFORE 'Rejected';--> statement-breakpoint
CREATE TABLE "notes" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "status_history" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "status_history" CASCADE;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "status" "application_status" DEFAULT 'Applied' NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "applied_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "status_updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notes_application_id_idx" ON "notes" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "notes_created_at_idx" ON "notes" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "applications_status_idx" ON "applications" USING btree ("status");--> statement-breakpoint
ALTER TABLE "applications" DROP COLUMN "notes";