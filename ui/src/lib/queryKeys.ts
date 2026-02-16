/**
 * Centralized query keys for React Query.
 * Using a factory pattern ensures type safety and consistency.
 */

export const applicationQueryKeys = {
	/** All applications list */
	all: ['applications'] as const,
	/** Active applications only (Applied/Interviewing) */
	active: ['applications', 'active'] as const,
	/** Archived applications */
	archived: ['applications', 'archived'] as const,
	/** Single application by ID */
	detail: (id: string) => ['applications', id] as const,
}

export const adminQueryKeys = {
	/** Admin users base key */
	users: ['admin', 'users'] as const,
	/** Admin users list with params */
	usersList: (params: { limit?: number; offset?: number; searchValue?: string }) =>
		['admin', 'users', params] as const,
	/** User sessions by user ID */
	userSessions: (userId: string) => ['admin', 'sessions', userId] as const,
}

export const calendarQueryKeys = {
	/** Calendar connection status */
	status: ['calendar', 'status'] as const,
	/** Base key for calendar events */
	eventsBase: ['calendar', 'events'] as const,
	/** Calendar events for a specific date */
	events: (date: string) => ['calendar', 'events', date] as const,
}

export const sessionQueryKeys = {
	/** Current user session */
	current: ['session'] as const,
}

export const eventQueryKeys = {
	/** Events for a specific application */
	byApplication: (applicationId: string) => ['events', applicationId] as const,
}

export const noteQueryKeys = {
	/** Notes for a specific application */
	byApplication: (applicationId: string) => ['notes', applicationId] as const,
}
