import { fromZonedTime } from 'date-fns-tz'
import { and, eq } from 'drizzle-orm'
import { Router } from 'express'
import { google } from 'googleapis'
import { auth } from '../auth'
import { db } from '../db'
import { account } from '../db/schema'
import { ErrorCodes, errorResponse, successResponse } from '../utils/responses'
import { getRequestId } from '../utils/request'

const router = Router()

// Initialize Google OAuth2 client
const oauth2Client = new google.auth.OAuth2(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	`${process.env.BETTER_AUTH_URL}/api/auth/callback/google`,
)

/**
 * GET /api/calendar/events
 * Fetch calendar events for a specific date
 */
router.get('/events', async (req, res) => {
	try {
		const session = await auth.api.getSession({ headers: req.headers as any })
		if (!session) {
			return res
				.status(401)
				.json(errorResponse(ErrorCodes.UNAUTHORIZED, 'Unauthorized', getRequestId(req)))
		}

		// Validate date query param
		const dateParam = req.query.date as string
		if (!dateParam) {
			return res
				.status(400)
				.json(
					errorResponse(
						ErrorCodes.BAD_REQUEST,
						'Date parameter is required (YYYY-MM-DD)',
						getRequestId(req),
					),
				)
		}

		// Parse start and end of day in the user's specific timezone
		// This ensures we get exactly the events for the day they see on their calendar
		const timeZone = (req.query.timeZone as string) || 'UTC'
		const timeMin = fromZonedTime(`${dateParam} 00:00:00`, timeZone)
		const timeMax = fromZonedTime(`${dateParam} 23:59:59.999`, timeZone)

		// 1. Get user's Google account token from database
		// We need to find the account record linked to this user for the 'google' provider
		const accounts = await db.select().from(account).where(eq(account.userId, session.user.id))

		const googleAccount = accounts.find((acc) => acc.providerId === 'google')

		if (!googleAccount || !googleAccount.accessToken || !googleAccount.refreshToken) {
			// User hasn't linked Google or we don't have tokens
			return res
				.status(400)
				.json(
					errorResponse(
						ErrorCodes.BAD_REQUEST,
						'Google Calendar not connected',
						getRequestId(req),
					),
				)
		}

		// 2. Set credentials
		oauth2Client.setCredentials({
			access_token: googleAccount.accessToken,
			refresh_token: googleAccount.refreshToken,
			expiry_date: googleAccount.accessTokenExpiresAt
				? new Date(googleAccount.accessTokenExpiresAt).getTime()
				: undefined,
		})

		// 3. Refresh token if needed
		// The googleapis library handles token refresh automatically if refresh_token is present
		// However, we should listen for the 'tokens' event to update our DB if it changes,
		// but for a simple stateless request, we can just rely on the library or manual check.

		// If the token is expired or close to expiring, refresh it manually to be safe and update DB
		const now = Date.now()
		const expiry = googleAccount.accessTokenExpiresAt ? new Date(googleAccount.accessTokenExpiresAt).getTime() : 0

		if (expiry < now + 60 * 1000) {
			// Less than 1 minute remaining
			try {
				const { credentials } = await oauth2Client.refreshAccessToken()

				// Update tokens in database
				if (credentials.access_token) {
					await db
						.update(account)
						.set({
							accessToken: credentials.access_token,
							accessTokenExpiresAt: credentials.expiry_date
								? new Date(credentials.expiry_date)
								: undefined,
							// Only update refresh token if a new one is returned (it often isn't)
							...(credentials.refresh_token ? { refreshToken: credentials.refresh_token } : {}),
						})
						.where(eq(account.id, googleAccount.id))

					oauth2Client.setCredentials(credentials)
				}
			} catch (refreshError) {
				console.error('Failed to refresh Google token:', refreshError)
				return res
					.status(401)
					.json(
						errorResponse(
							ErrorCodes.UNAUTHORIZED,
							'Failed to refresh Google authentication. Please reconnect your account.',
							getRequestId(req),
						),
					)
			}
		}

		// 4. Fetch events
		const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

		const response = await calendar.events.list({
			calendarId: 'primary',
			timeMin: timeMin.toISOString(),
			timeMax: timeMax.toISOString(),
			timeZone: timeZone,
			singleEvents: true,
			orderBy: 'startTime',
		})

		const events = response.data.items || []

		// 5. Transform and return
		const mappedEvents = events.map((event) => ({
			id: event.id,
			title: event.summary || 'No Title',
			description: event.description,
			start: event.start?.dateTime || event.start?.date, // dateTime for timed, date for all-day
			end: event.end?.dateTime || event.end?.date,
			url: event.htmlLink ? `${event.htmlLink}&authuser=${session.user.email}` : undefined,
			location: event.location,
			isAllDay: !event.start?.dateTime, // If no dateTime, it's an all-day event
		}))

		res.json(successResponse(mappedEvents, getRequestId(req)))
	} catch (error) {
		console.error('Error fetching calendar events:', error)
		res.status(500).json(
			errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch calendar events', getRequestId(req)),
		)
	}
})

/**
 * GET /api/calendar/status
 * Check if the user has a linked Google Calendar (Google account)
 */
router.get('/status', async (req, res) => {
	try {
		const session = await auth.api.getSession({ headers: req.headers as any })
		if (!session) {
			return res
				.status(401)
				.json(errorResponse(ErrorCodes.UNAUTHORIZED, 'Unauthorized', getRequestId(req)))
		}

		const accounts = await db.select().from(account).where(eq(account.userId, session.user.id))
		const googleAccount = accounts.find((acc) => acc.providerId === 'google')

		res.json(successResponse({ connected: !!googleAccount }, getRequestId(req)))
	} catch (error) {
		console.error('Error checking calendar status:', error)
		res.status(500).json(
			errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to check calendar status', getRequestId(req)),
		)
	}
})

/**
 * DELETE /api/calendar
 * Unlink Google Calendar (remove Google account)
 */
router.delete('/', async (req, res) => {
	try {
		const session = await auth.api.getSession({ headers: req.headers as any })
		if (!session) {
			return res
				.status(401)
				.json(errorResponse(ErrorCodes.UNAUTHORIZED, 'Unauthorized', getRequestId(req)))
		}

		await db.delete(account).where(and(eq(account.userId, session.user.id), eq(account.providerId, 'google')))

		res.json(successResponse({ disconnected: true }, getRequestId(req)))
	} catch (error) {
		console.error('Error disconnecting calendar:', error)
		res.status(500).json(
			errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to disconnect calendar', getRequestId(req)),
		)
	}
})

export default router
