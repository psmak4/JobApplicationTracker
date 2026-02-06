/**
 * Migration script to move calendar events from statusHistory to new calendarEvents table.
 *
 * Run with: npx tsx src/db/migrate-events.ts
 */
import { isNotNull } from 'drizzle-orm'
import { db } from './index'
import { calendarEvents, statusHistory } from './schema'

async function migrateEvents() {
	console.log('Starting calendar events migration...')

	// 1. Fetch all status entries with event data
	// Note: We're querying raw SQL since we've already removed the columns from the schema
	const statusEntriesWithEvents = await db.execute<{
		id: string
		application_id: string
		event_id: string | null
		event_title: string | null
		event_url: string | null
		event_start_time: Date | null
		event_end_time: Date | null
	}>(`
		SELECT id, application_id, event_id, event_title, event_url, event_start_time, event_end_time
		FROM status_history
		WHERE event_id IS NOT NULL
	`)

	// db.execute returns a RowList which is iterable like an array
	const entries = [...statusEntriesWithEvents]

	if (entries.length === 0) {
		console.log('No calendar events found to migrate.')
		return
	}

	console.log(`Found ${entries.length} status entries with calendar events.`)

	// 2. Insert into calendarEvents table
	let successCount = 0
	let errorCount = 0

	for (const entry of entries) {
		try {
			// Only migrate if we have required fields
			if (!entry.event_title || !entry.event_start_time) {
				console.log(`Skipping entry ${entry.id}: missing required fields`)
				errorCount++
				continue
			}

			await db.insert(calendarEvents).values({
				applicationId: entry.application_id,
				googleEventId: entry.event_id,
				title: entry.event_title,
				url: entry.event_url,
				startTime: new Date(entry.event_start_time),
				endTime: entry.event_end_time ? new Date(entry.event_end_time) : null,
			})

			successCount++
		} catch (error) {
			console.error(`Failed to migrate event from status ${entry.id}:`, error)
			errorCount++
		}
	}

	console.log(`Migration complete.`)
	console.log(`  - Successfully migrated: ${successCount}`)
	console.log(`  - Errors/Skipped: ${errorCount}`)

	// 3. Optional: Drop the old columns (handled by schema migration)
	console.log('\nNote: Old event columns will be removed when you run db:generate and db:push.')
}

migrateEvents()
	.then(() => {
		console.log('Done.')
		process.exit(0)
	})
	.catch((error) => {
		console.error('Migration failed:', error)
		process.exit(1)
	})
