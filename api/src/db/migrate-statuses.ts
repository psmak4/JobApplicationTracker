/**
 * Migration script to simplify application statuses
 *
 * This script must be run BEFORE db:push because it:
 * 1. Updates all data to use only the new status values
 * 2. Works with the existing enum in the database
 *
 * Mapping:
 * - Applied => Applied
 * - Phone Screen => Interviewing
 * - Technical Interview => Interviewing
 * - On-site Interview => Interviewing
 * - Offer => Offer Received
 * - Rejected => Rejected
 * - Withdrawn => Withdrawn
 * - Other => Interviewing
 *
 * Run with: npx tsx src/db/migrate-statuses.ts
 */
import { sql } from 'drizzle-orm'
import { db } from './index'

async function migrateStatuses() {
	console.log('Starting status migration...')

	// Step 1: Add new enum values that don't exist yet
	console.log('Adding new enum values...')
	try {
		await db.execute(sql`ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'Interviewing'`)
	} catch (e) {
		console.log('Interviewing value may already exist')
	}
	try {
		await db.execute(sql`ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'Offer Received'`)
	} catch (e) {
		console.log('Offer Received value may already exist')
	}

	// Step 2: Update statuses in status_history table (this is the only table with status column)
	console.log('Updating status_history table...')
	await db.execute(sql`
		UPDATE status_history SET status = 'Interviewing'
		WHERE status IN ('Phone Screen', 'Technical Interview', 'On-site Interview', 'Other')
	`)
	await db.execute(sql`
		UPDATE status_history SET status = 'Offer Received'
		WHERE status = 'Offer'
	`)

	console.log('Data migration complete!')
	console.log('')
	console.log('Next steps:')
	console.log('1. Run these SQL commands in your database to swap the enum type:')
	console.log('')
	console.log(
		"   CREATE TYPE application_status_new AS ENUM ('Applied', 'Interviewing', 'Offer Received', 'Rejected', 'Withdrawn');",
	)
	console.log(
		'   ALTER TABLE status_history ALTER COLUMN status TYPE application_status_new USING status::text::application_status_new;',
	)
	console.log('   DROP TYPE application_status;')
	console.log('   ALTER TYPE application_status_new RENAME TO application_status;')
	console.log('')
	console.log('2. Then run: npm run db:push')

	process.exit(0)
}

migrateStatuses().catch((error) => {
	console.error('Migration failed:', error)
	process.exit(1)
})
