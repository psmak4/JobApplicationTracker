import type { ApplicationStatus, ApplicationSummary } from '@/types'

/**
 * Get the current status from an application summary.
 */
export function getCurrentStatus(app: ApplicationSummary): ApplicationStatus | 'Unknown' {
	return app.currentStatus ?? 'Unknown'
}

/**
 * Get the last status date from an application summary.
 */
export function getLastStatusDate(app: ApplicationSummary): string {
	return app.lastStatusDate ?? app.updatedAt
}

/**
 * Get a color class based on how stale an application is.
 */
export function getStalenessColor(statusDate: string, status: string): string {
	const isInactive = ['Offer Received', 'Rejected', 'Withdrawn'].includes(status)
	if (isInactive) return 'text-muted-foreground'

	const daysSinceUpdate = (new Date().getTime() - new Date(statusDate).getTime()) / (1000 * 3600 * 24)

	if (daysSinceUpdate > 14) return 'text-red-500 font-medium'
	if (daysSinceUpdate > 7) return 'text-yellow-600 font-medium'
	return 'text-muted-foreground'
}
