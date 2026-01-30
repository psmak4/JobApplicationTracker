CREATE INDEX "applications_user_id_idx" ON "applications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "applications_updated_at_idx" ON "applications" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "status_history_application_id_idx" ON "status_history" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "status_history_date_idx" ON "status_history" USING btree ("date");