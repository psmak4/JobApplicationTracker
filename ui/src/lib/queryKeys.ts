/**
 * Centralized query keys for React Query.
 * Using a factory pattern ensures type safety and consistency.
 */

export const applicationQueryKeys = {
	/** All applications list */
	all: ['applications'] as const,
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

export const emailQueryKeys = {
	/** Email templates list */
	templates: ['admin', 'email', 'templates'] as const,
}
