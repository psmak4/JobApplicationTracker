import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import apiClient, { extractData } from '@/lib/api-client'
import { getErrorMessage } from '@/lib/error-utils'
import { applicationQueryKeys } from '@/lib/queryKeys'
import type { Application, ApplicationSummary, MutationError } from '@/types'

export const useApplications = () => {
	return useQuery<ApplicationSummary[]>({
		queryKey: applicationQueryKeys.all,
		queryFn: async () => {
			const response = await apiClient.get('/applications/list')
			return extractData(response.data)
		},
		staleTime: 1000 * 60 * 2,
	})
}

export const useActiveApplications = () => {
	return useQuery<ApplicationSummary[]>({
		queryKey: applicationQueryKeys.active,
		queryFn: async () => {
			const response = await apiClient.get('/applications/active')
			return extractData(response.data)
		},
		staleTime: 1000 * 60 * 2,
	})
}

export const useApplication = (id: string) => {
	return useQuery<Application>({
		queryKey: applicationQueryKeys.detail(id),
		queryFn: async () => {
			const response = await apiClient.get(`/applications/${id}`)
			return extractData(response.data)
		},
		enabled: !!id,
	})
}

export const useApplicationPrefetch = () => {
	const queryClient = useQueryClient()

	return (id: string) => {
		queryClient.prefetchQuery({
			queryKey: applicationQueryKeys.detail(id),
			queryFn: async () => {
				const response = await apiClient.get(`/applications/${id}`)
				return extractData(response.data)
			},
		})
	}
}

export const useDeleteApplication = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (id: string) => {
			await apiClient.delete(`/applications/${id}`)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: applicationQueryKeys.all })
			toast.success('Application deleted successfully')
		},
		onError: (error: MutationError) => {
			toast.error('Error', { description: getErrorMessage(error, 'Failed to delete application') })
		},
	})
}

export const useArchivedApplications = () => {
	return useQuery<ApplicationSummary[]>({
		queryKey: applicationQueryKeys.archived,
		queryFn: async () => {
			const response = await apiClient.get('/applications/archived/list')
			return extractData(response.data)
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
	})
}
