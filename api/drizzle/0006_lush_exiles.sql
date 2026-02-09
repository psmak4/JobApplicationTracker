ALTER TABLE "status_history" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."application_status";--> statement-breakpoint
CREATE TYPE "public"."application_status" AS ENUM('Applied', 'Interviewing', 'Offer Received', 'Rejected', 'Withdrawn');--> statement-breakpoint
ALTER TABLE "status_history" ALTER COLUMN "status" SET DATA TYPE "public"."application_status" USING "status"::"public"."application_status";--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "closed_at" timestamp;--> statement-breakpoint
CREATE INDEX "applications_closed_at_idx" ON "applications" USING btree ("closed_at");