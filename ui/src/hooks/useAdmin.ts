import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authClient } from '@/lib/auth-client'
import { getErrorMessage } from '@/lib/error-utils'

export interface AdminUser {
	id: string
	name: string
	email: string
	emailVerified: boolean
	image: string | null
	createdAt: Date
	updatedAt: Date
	role: string | null
	banned: boolean | null
	banReason: string | null
	banExpires: Date | null
}

export interface ListUsersParams {
	limit?: number
	offset?: number
	searchValue?: string
	searchField?: 'email' | 'name'
	sortBy?: string
	sortDirection?: 'asc' | 'desc'
}

export interface ListUsersResponse {
	users: AdminUser[]
	total: number
	limit?: number
	offset?: number
}

// Query keys for caching
export const adminQueryKeys = {
	users: ['admin', 'users'] as const,
	usersList: (params: ListUsersParams) => ['admin', 'users', params] as const,
	userSessions: (userId: string) => ['admin', 'sessions', userId] as const,
}

// Hook to list all users with pagination and search
export function useAdminUsers(params: ListUsersParams = {}) {
	return useQuery({
		queryKey: adminQueryKeys.usersList(params),
		queryFn: async (): Promise<ListUsersResponse> => {
			const { data, error } = await authClient.admin.listUsers({
				query: {
					limit: params.limit ?? 20,
					offset: params.offset ?? 0,
					searchValue: params.searchValue,
					searchField: params.searchField,
					sortBy: params.sortBy ?? 'createdAt',
					sortDirection: params.sortDirection ?? 'desc',
				},
			})

			if (error) {
				throw new Error(getErrorMessage(error))
			}

			return data as ListUsersResponse
		},
	})
}

// Hook to list user sessions
export function useAdminUserSessions(userId: string) {
	return useQuery({
		queryKey: adminQueryKeys.userSessions(userId),
		queryFn: async () => {
			const { data, error } = await authClient.admin.listUserSessions({
				userId,
			})

			if (error) {
				throw new Error(getErrorMessage(error))
			}

			return data
		},
		enabled: !!userId,
	})
}

// Hook to ban a user
export function useBanUser() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			userId,
			banReason,
			banExpiresIn,
		}: {
			userId: string
			banReason?: string
			banExpiresIn?: number
		}) => {
			const { error } = await authClient.admin.banUser({
				userId,
				banReason,
				banExpiresIn,
			})

			if (error) {
				throw new Error(getErrorMessage(error))
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminQueryKeys.users })
		},
	})
}

// Hook to unban a user
export function useUnbanUser() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ userId }: { userId: string }) => {
			const { error } = await authClient.admin.unbanUser({
				userId,
			})

			if (error) {
				throw new Error(getErrorMessage(error))
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminQueryKeys.users })
		},
	})
}

// Hook to set user role
export function useSetUserRole() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ userId, role }: { userId: string; role: 'user' | 'admin' }) => {
			const { error } = await authClient.admin.setRole({
				userId,
				role,
			})

			if (error) {
				throw new Error(getErrorMessage(error))
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminQueryKeys.users })
		},
	})
}

// Hook to remove a user
export function useRemoveUser() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ userId }: { userId: string }) => {
			const { error } = await authClient.admin.removeUser({
				userId,
			})

			if (error) {
				throw new Error(getErrorMessage(error))
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminQueryKeys.users })
		},
	})
}

// Hook to impersonate a user
export function useImpersonateUser() {
	return useMutation({
		mutationFn: async ({ userId }: { userId: string }) => {
			const { error } = await authClient.admin.impersonateUser({
				userId,
			})

			if (error) {
				throw new Error(getErrorMessage(error))
			}

			// Reload the page to reflect the impersonated user
			window.location.reload()
		},
	})
}

// Hook to stop impersonating
export function useStopImpersonating() {
	return useMutation({
		mutationFn: async () => {
			const { error } = await authClient.admin.stopImpersonating()

			if (error) {
				throw new Error(getErrorMessage(error))
			}

			// Reload the page to reflect the original user
			window.location.reload()
		},
	})
}

// Hook to revoke a specific session
export function useRevokeUserSession() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ sessionToken }: { sessionToken: string }) => {
			const { error } = await authClient.admin.revokeUserSession({
				sessionToken,
			})

			if (error) {
				throw new Error(getErrorMessage(error))
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin', 'sessions'] })
		},
	})
}

// Hook to revoke all sessions for a user
export function useRevokeAllUserSessions() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ userId }: { userId: string }) => {
			const { error } = await authClient.admin.revokeUserSessions({
				userId,
			})

			if (error) {
				throw new Error(getErrorMessage(error))
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin', 'sessions'] })
		},
	})
}
