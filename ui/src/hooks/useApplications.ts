import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '../lib/api-client'
import { applicationQueryKeys } from '../lib/queryKeys'
import type { Application } from '../types'

export const useApplications = () => {
	return useQuery<Application[]>({
		queryKey: applicationQueryKeys.all,
		queryFn: async () => {
			const response = await apiClient.get('/applications')
			return response.data
		},
	})
}

export const useApplication = (id: string) => {
	return useQuery<Application>({
		queryKey: applicationQueryKeys.detail(id),
		queryFn: async () => {
			const response = await apiClient.get(`/applications/${id}`)
			return response.data
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
				return response.data
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
		},
	})
}
