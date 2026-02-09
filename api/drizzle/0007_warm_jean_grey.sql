ALTER TABLE "applications" RENAME COLUMN "closed_at" TO "archived_at";--> statement-breakpoint
DROP INDEX "applications_closed_at_idx";--> statement-breakpoint
CREATE INDEX "applications_archived_at_idx" ON "applications" USING btree ("archived_at");