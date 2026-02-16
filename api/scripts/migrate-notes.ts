/**
 * Migration script: Move existing application.notes text data to the new notes table.
 *
 * Usage: npx tsx api/scripts/migrate-notes.ts
 */
import 'dotenv/config'
import { isNotNull, ne } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../src/db/schema'

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
	console.error('DATABASE_URL environment variable is required')
	process.exit(1)
}

const client = postgres(DATABASE_URL)
const db = drizzle(client, { schema })

async function migrateNotes() {
	console.log('Starting notes migration...\n')

	// Find all applications with non-empty notes
	const appsWithNotes = await db
		.select({
			id: schema.applications.id,
			notes: schema.applications.notes,
			createdAt: schema.applications.createdAt,
		})
		.from(schema.applications)
		.where(isNotNull(schema.applications.notes))

	// Filter out empty strings
	const toMigrate = appsWithNotes.filter((app) => app.notes && app.notes.trim() !== '')

	if (toMigrate.length === 0) {
		console.log('No notes to migrate. Done!')
		process.exit(0)
	}

	console.log(`Found ${toMigrate.length} application(s) with notes to migrate.\n`)

	let migrated = 0
	let errors = 0

	for (const app of toMigrate) {
		try {
			await db.insert(schema.notes).values({
				applicationId: app.id,
				content: app.notes!.trim(),
				createdAt: app.createdAt, // Preserve the original application's createdAt as the note date
			})
			migrated++
			console.log(`  ✓ Migrated note for application ${app.id}`)
		} catch (err) {
			errors++
			console.error(`  ✗ Failed to migrate note for application ${app.id}:`, err)
		}
	}

	console.log(`\nMigration complete:`)
	console.log(`  ✓ ${migrated} note(s) migrated successfully`)
	if (errors > 0) {
		console.log(`  ✗ ${errors} error(s)`)
	}

	process.exit(errors > 0 ? 1 : 0)
}

migrateNotes().catch((err) => {
	console.error('Migration failed:', err)
	process.exit(1)
})
