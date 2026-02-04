import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authClient } from '@/lib/auth-client'
import { getErrorMessage } from '@/lib/error-utils'
import { sessionQueryKeys } from '@/lib/queryKeys'

export interface UpdateUserData {
	name?: string
	image?: string
}

// Hook to update the current user's profile
export function useUpdateProfile() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (data: UpdateUserData) => {
			const { error } = await authClient.updateUser(data)

			if (error) {
				throw new Error(getErrorMessage(error))
			}
		},
		onSuccess: () => {
			// Invalidate session to refresh user data
			queryClient.invalidateQueries({ queryKey: sessionQueryKeys.current })
		},
	})
}

// Hook to change password
export function useChangePassword() {
	return useMutation({
		mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
			const { error } = await authClient.changePassword({
				currentPassword,
				newPassword,
			})

			if (error) {
				throw new Error(getErrorMessage(error))
			}
		},
	})
}
