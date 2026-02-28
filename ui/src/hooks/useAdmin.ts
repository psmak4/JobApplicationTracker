import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import apiClient from '@/lib/api-client'
import { authClient } from '@/lib/auth-client'
import { getErrorMessage } from '@/lib/error-utils'
import { adminQueryKeys } from '@/lib/queryKeys'

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

export function useAdminUsers(params: ListUsersParams = {}) {
	return useQuery({
		queryKey: adminQueryKeys.usersList({
			limit: params.limit,
			offset: params.offset,
			searchValue: params.searchValue,
		}),
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
		staleTime: 1000 * 60 * 2,
	})
}

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
		staleTime: 1000 * 60,
	})
}

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
			toast.success('User banned successfully')
		},
		onError: (error) => {
			toast.error('Error', { description: getErrorMessage(error) })
		},
	})
}

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
			toast.success('User unbanned successfully')
		},
		onError: (error) => {
			toast.error('Error', { description: getErrorMessage(error) })
		},
	})
}

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
			toast.success('User role updated successfully')
		},
		onError: (error) => {
			toast.error('Error', { description: getErrorMessage(error) })
		},
	})
}

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
			toast.success('User removed successfully')
		},
		onError: (error) => {
			toast.error('Error', { description: getErrorMessage(error) })
		},
	})
}

export function useRemoveUsers() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ userIds }: { userIds: string[] }) => {
			const response = await apiClient.post('/admin/users/bulk-delete', { userIds })
			return response.data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminQueryKeys.users })
			toast.success('Users removed successfully')
		},
		onError: (error) => {
			toast.error('Error', { description: getErrorMessage(error) })
		},
	})
}

export function useImpersonateUser() {
	return useMutation({
		mutationFn: async ({ userId }: { userId: string }) => {
			const { error } = await authClient.admin.impersonateUser({
				userId,
			})

			if (error) {
				throw new Error(getErrorMessage(error))
			}

			window.location.reload()
		},
	})
}

export function useStopImpersonating() {
	return useMutation({
		mutationFn: async () => {
			const { error } = await authClient.admin.stopImpersonating()

			if (error) {
				throw new Error(getErrorMessage(error))
			}

			window.location.reload()
		},
	})
}

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
