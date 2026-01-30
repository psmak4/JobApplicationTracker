import dotenv from 'dotenv'

dotenv.config()

/**
 * Environment variable configuration with validation
 * 
 * This module validates all required environment variables at startup
 * and fails fast with clear error messages if any are missing or invalid.
 */

interface EnvConfig {
	// Server
	PORT: number
	NODE_ENV: string

	// Database
	DATABASE_URL: string

	// Authentication
	BETTER_AUTH_SECRET: string
	BETTER_AUTH_URL: string

	// Email
	RESEND_API_KEY: string
	RESEND_FROM_EMAIL: string

	// CORS
	CORS_ORIGINS: string[]
}

const requiredVars: Array<keyof EnvConfig> = [
	'DATABASE_URL',
	'BETTER_AUTH_SECRET',
	'BETTER_AUTH_URL',
	'RESEND_API_KEY',
]

const optionalVars: Array<keyof EnvConfig> = ['PORT', 'NODE_ENV', 'CORS_ORIGINS', 'RESEND_FROM_EMAIL']

/**
 * Validate that a string is a valid URL
 */
function isValidUrl(url: string): boolean {
	try {
		new URL(url)
		return true
	} catch {
		return false
	}
}

/**
 * Validate all environment variables
 * 
 * @throws Error if any required variables are missing or invalid
 */
export function validateEnv(): EnvConfig {
	const errors: string[] = []

	// Check required variables
	for (const varName of requiredVars) {
		const value = process.env[varName]
		if (!value || value.trim() === '') {
			errors.push(`Missing required environment variable: ${varName}`)
		}
	}

	// Validate URL formats
	if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('postgresql://')) {
		errors.push('DATABASE_URL must be a valid PostgreSQL connection string (postgresql://...)')
	}

	if (process.env.BETTER_AUTH_URL && !isValidUrl(process.env.BETTER_AUTH_URL)) {
		errors.push('BETTER_AUTH_URL must be a valid URL')
	}

	// Parse CORS origins
	let corsOrigins: string[] = ['http://localhost:5173', 'http://localhost:3000']
	if (process.env.CORS_ORIGINS) {
		corsOrigins = process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
		// Validate each origin is a valid URL
		for (const origin of corsOrigins) {
			if (!isValidUrl(origin)) {
				errors.push(`Invalid CORS origin: ${origin}`)
			}
		}
	}

	// If there are errors, log them and exit
	if (errors.length > 0) {
		console.error('╔══════════════════════════════════════════════════════════════╗')
		console.error('║           Environment Configuration Errors                    ║')
		console.error('╚══════════════════════════════════════════════════════════════╝')
		console.error()
		for (const error of errors) {
			console.error(`  ❌ ${error}`)
		}
		console.error()
		console.error('Please check your .env file and ensure all required variables are set.')
		console.error()
		console.error('Required variables:')
		for (const varName of requiredVars) {
			console.error(`  - ${varName}`)
		}
		console.error()
		process.exit(1)
	}

	// Build and return config object
	const config: EnvConfig = {
		PORT: parseInt(process.env.PORT || '4000', 10),
		NODE_ENV: process.env.NODE_ENV || 'development',
		DATABASE_URL: process.env.DATABASE_URL!,
		BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET!,
		BETTER_AUTH_URL: process.env.BETTER_AUTH_URL!,
		RESEND_API_KEY: process.env.RESEND_API_KEY!,
		RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
		CORS_ORIGINS: corsOrigins,
	}

	// Log success in development
	if (config.NODE_ENV === 'development') {
		console.log('✅ Environment variables validated successfully')
		console.log(`   NODE_ENV: ${config.NODE_ENV}`)
		console.log(`   PORT: ${config.PORT}`)
		console.log(`   CORS_ORIGINS: ${config.CORS_ORIGINS.join(', ')}`)
	}

	return config
}

// Export singleton config (validated on first import)
export const env = validateEnv()
