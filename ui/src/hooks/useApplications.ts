import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import apiClient from '../lib/api-client'
import { applicationQueryKeys } from '../lib/queryKeys'
import type { ApiSuccessResponse, Application } from '../types'

// Helper to extract data from API response
const extractData = <T>(response: ApiSuccessResponse<T>): T => response.data

export const useApplications = () => {
	return useQuery<Application[]>({
		queryKey: applicationQueryKeys.all,
		queryFn: async () => {
			const response = await apiClient.get('/applications')
			return extractData(response.data)
		},
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
		onError: (error: any) => {
			const message = error.response?.data?.error?.message || 'Failed to delete application'
			toast.error('Error', { description: message })
		},
	})
}
