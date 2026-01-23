-- Change date column to timestamp in status_history table
ALTER TABLE "status_history" 
ALTER COLUMN "date" TYPE timestamp USING "date"::timestamp;