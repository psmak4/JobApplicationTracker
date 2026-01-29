import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin } from 'better-auth/plugins'
import { db } from './db/index'
import * as schema from './db/schema'
import { notificationService } from './services/notifications'

// Parse trusted origins from environment variable, fallback to localhost for development
const trustedOrigins = process.env.CORS_ORIGINS
	? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
	: ['http://localhost:5173', 'http://localhost:3000']

// Parse admin user IDs from environment variable
const adminUserIds = process.env.ADMIN_USER_IDS ? process.env.ADMIN_USER_IDS.split(',').map((id) => id.trim()) : []

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema: schema,
	}),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true, // Enable email verification
		sendResetPassword: async ({ user, url }) => {
			await notificationService.sendPasswordReset(user.email, user.name, url)
		},
	},
	emailVerification: {
		sendVerificationEmail: async ({ user, url }) => {
			await notificationService.sendVerificationEmail(user.email, user.name, url)
		},
		sendOnSignUp: true,
	},
	trustedOrigins,
	plugins: [
		admin({
			adminUserIds,
			defaultRole: 'user',
			defaultBanReason: 'Violation of terms of service',
			defaultBanExpiresIn: undefined, // Permanent ban by default
			impersonationSessionDuration: 60 * 60, // 1 hour
		}),
	],
})
