import type {
	ApplicationSummary,
	DashboardStats,
	EventGroups,
	RecentActivityStats,
	StaleApplication,
	UpcomingEventWithApp,
} from '@/types'

/**
 * Status-specific thresholds (in days) for when an application is considered "stale".
 * Terminal statuses (Accepted, Declined, Rejected, Withdrawn) are not tracked.
 */
const STALE_THRESHOLDS: Partial<Record<string, number>> = {
	Applied: 14,
	Interviewing: 21,
	'Offer Received': 3,
}

/**
 * Get applications that may need attention based on time-since-last-update thresholds.
 * Sorted by oldest update first (longest without activity at top).
 */
export function getStaleApplications(applications: ApplicationSummary[]): StaleApplication[] {
	const now = new Date()

	return applications
		.map((app) => {
			const threshold = STALE_THRESHOLDS[app.status]
			if (!threshold) return null

			const lastUpdate = new Date(app.statusUpdatedAt)
			const daysSinceUpdate = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24))

			if (daysSinceUpdate >= threshold) {
				return { ...app, daysSinceUpdate }
			}
			return null
		})
		.filter((app): app is StaleApplication => app !== null)
		.sort((a, b) => b.daysSinceUpdate - a.daysSinceUpdate)
}

/**
 * Get upcoming calendar events for the next 7 days, enriched with application context.
 * Sorted chronologically (earliest first).
 */
export function getUpcomingEvents(applications: ApplicationSummary[]): UpcomingEventWithApp[] {
	const now = new Date()
	const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

	const events: UpcomingEventWithApp[] = []

	for (const app of applications) {
		for (const event of app.upcomingEvents || []) {
			const eventDate = new Date(event.startTime)
			if (eventDate >= now && eventDate <= sevenDaysFromNow) {
				events.push({
					...event,
					company: app.company,
					jobTitle: app.jobTitle,
				})
			}
		}
	}

	return events.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
}

/**
 * Get activity counts for the last 7 days.
 */
export function getRecentActivity(applications: ApplicationSummary[]): RecentActivityStats {
	const sevenDaysAgo = new Date()
	sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

	return {
		applied: applications.filter((app) => new Date(app.appliedAt) >= sevenDaysAgo).length,
		interviews: applications.filter(
			(app) => app.status === 'Interviewing' && new Date(app.statusUpdatedAt) >= sevenDaysAgo,
		).length,
		offers: applications.filter(
			(app) => app.status === 'Offer Received' && new Date(app.statusUpdatedAt) >= sevenDaysAgo,
		).length,
	}
}

/**
 * Get urgency color classes based on days since last update.
 */
export function getUrgencyColor(days: number): string {
	if (days >= 21) return 'text-red-600 dark:text-red-400'
	if (days >= 14) return 'text-orange-600 dark:text-orange-400'
	if (days >= 7) return 'text-amber-600 dark:text-amber-400'
	return 'text-muted-foreground'
}

/**
 * Group upcoming events by date category: Today, Tomorrow, This Week.
 */
export function groupEventsByDate(events: UpcomingEventWithApp[]): EventGroups {
	const now = new Date()
	const tomorrow = new Date(now)
	tomorrow.setDate(tomorrow.getDate() + 1)

	const todayStr = now.toDateString()
	const tomorrowStr = tomorrow.toDateString()

	return {
		today: events.filter((e) => new Date(e.startTime).toDateString() === todayStr),
		tomorrow: events.filter((e) => new Date(e.startTime).toDateString() === tomorrowStr),
		thisWeek: events.filter((e) => {
			const eventDate = new Date(e.startTime)
			return eventDate.toDateString() !== todayStr && eventDate.toDateString() !== tomorrowStr
		}),
	}
}

const HIT_RATE_STATUSES = new Set(['Interviewing', 'Offer Received', 'Offer Accepted', 'Offer Declined'])

/**
 * Get at-a-glance dashboard statistics.
 */
export function getDashboardStats(applications: ApplicationSummary[]): DashboardStats {
	const sevenDaysAgo = new Date()
	sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

	const active = applications.length

	const thisWeekNew = applications.filter((app) => new Date(app.appliedAt) >= sevenDaysAgo).length

	const thisWeekInterviews = applications.filter(
		(app) => app.status === 'Interviewing' && new Date(app.statusUpdatedAt) >= sevenDaysAgo,
	).length

	// Average response time: days between appliedAt and statusUpdatedAt
	// for applications that have moved beyond 'Applied' status
	const respondedApps = applications.filter((app) => app.status !== 'Applied')
	let avgResponseDays: number | null = null
	if (respondedApps.length > 0) {
		const totalDays = respondedApps.reduce((sum, app) => {
			const applied = new Date(app.appliedAt).getTime()
			const responded = new Date(app.statusUpdatedAt).getTime()
			return sum + (responded - applied) / (1000 * 60 * 60 * 24)
		}, 0)
		avgResponseDays = Math.round(totalDays / respondedApps.length)
	}

	// Hit rate: applications that reached interview or beyond
	const hitRateNumerator = applications.filter((app) => HIT_RATE_STATUSES.has(app.status)).length
	const hitRateDenominator = active
	const hitRatePercentage = active > 0 ? Math.round((hitRateNumerator / hitRateDenominator) * 100) : 0

	return {
		active,
		thisWeekNew,
		thisWeekInterviews,
		avgResponseDays,
		hitRateNumerator,
		hitRateDenominator,
		hitRatePercentage,
	}
}
