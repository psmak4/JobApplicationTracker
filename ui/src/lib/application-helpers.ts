import { CLOSED_STATUSES } from '@/constants'
import type { ApplicationStatus } from '@/types'

/**
 * Check if a status is a terminal/closed status.
 */
export function isClosedStatus(status: ApplicationStatus): boolean {
	return CLOSED_STATUSES.includes(status)
}

/**
 * Get the kanban column for a given status.
 */
export function getKanbanColumn(status: ApplicationStatus): string {
	if (CLOSED_STATUSES.includes(status)) return 'Closed'
	return status
}
