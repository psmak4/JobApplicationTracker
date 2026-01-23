import { relations } from 'drizzle-orm'
import { boolean, date, pgEnum, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'

// Enums
export const applicationStatusEnum = pgEnum('application_status', [
	'Applied',
	'Phone Screen',
	'Technical Interview',
	'On-site Interview',
	'Offer',
	'Rejected',
	'Withdrawn',
	'Other',
])

export const workTypeEnum = pgEnum('work_type', ['Remote', 'Hybrid', 'On-site'])

// Better Auth tables - we'll let Better Auth create these, but we need them for references
export const user = pgTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('emailVerified').notNull(),
	image: text('image'),
	createdAt: timestamp('createdAt').notNull(),
	updatedAt: timestamp('updatedAt').notNull(),
})

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	expiresAt: timestamp('expiresAt').notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('createdAt').notNull(),
	updatedAt: timestamp('updatedAt').notNull(),
	ipAddress: text('ipAddress'),
	userAgent: text('userAgent'),
	userId: text('userId')
		.notNull()
		.references(() => user.id),
})

export const account = pgTable('account', {
	id: text('id').primaryKey(),
	accountId: text('accountId').notNull(),
	providerId: text('providerId').notNull(),
	userId: text('userId')
		.notNull()
		.references(() => user.id),
	accessToken: text('accessToken'),
	refreshToken: text('refreshToken'),
	idToken: text('idToken'),
	accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
	refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('createdAt').notNull(),
	updatedAt: timestamp('updatedAt').notNull(),
})

export const verification = pgTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expiresAt').notNull(),
	createdAt: timestamp('createdAt'),
	updatedAt: timestamp('updatedAt'),
})

// Applications table - using text id to match Better Auth
export const applications = pgTable('applications', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	company: varchar('company', { length: 255 }).notNull(),
	jobTitle: varchar('job_title', { length: 255 }).notNull(),
	jobDescriptionUrl: text('job_description_url'),
	salary: varchar('salary', { length: 255 }),
	location: varchar('location', { length: 255 }),
	workType: workTypeEnum('work_type'),
	contactInfo: text('contact_info'),
	notes: text('notes'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Status History table - using text id
export const statusHistory = pgTable('status_history', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	applicationId: text('application_id')
		.notNull()
		.references(() => applications.id, { onDelete: 'cascade' }),
	status: applicationStatusEnum('status').notNull(),
	date: timestamp('date').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const applicationsRelations = relations(applications, ({ many }) => ({
	statusHistory: many(statusHistory),
}))

export const statusHistoryRelations = relations(statusHistory, ({ one }) => ({
	application: one(applications, {
		fields: [statusHistory.applicationId],
		references: [applications.id],
	}),
}))

// Types for TypeScript
export type User = typeof user.$inferSelect
export type NewUser = typeof user.$inferInsert
export type Application = typeof applications.$inferSelect
export type NewApplication = typeof applications.$inferInsert
export type StatusHistory = typeof statusHistory.$inferSelect
export type NewStatusHistory = typeof statusHistory.$inferInsert
