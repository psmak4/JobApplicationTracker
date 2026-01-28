import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../lib/api-client'
import type { ApplicationStatus } from '../types'

export interface CreateApplicationData {
	company: string
	jobTitle: string
	jobDescriptionUrl?: string
	salary?: string
	location?: string
	workType?: string
	contactInfo?: string
	notes?: string
	status: ApplicationStatus
	date?: string
}

export const useCreateApplication = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (data: CreateApplicationData) => {
			const response = await apiClient.post('/applications', data)
			return response.data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['applications'] })
		},
	})
}

export const useUpdateApplication = (id: string) => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (data: Partial<CreateApplicationData>) => {
			const response = await apiClient.put(`/applications/${id}`, data)
			return response.data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['applications'] })
			queryClient.invalidateQueries({ queryKey: ['applications', id] })
		},
	})
}

export const useAddStatus = (applicationId: string) => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (data: { status: ApplicationStatus; date: string }) => {
			const response = await apiClient.post(`/statuses/application/${applicationId}`, data)
			return response.data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['applications', applicationId] })
			queryClient.invalidateQueries({ queryKey: ['applications'] })
		},
	})
}

export const useDeleteStatus = (applicationId: string) => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (statusId: string) => {
			await apiClient.delete(`/statuses/${statusId}`)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['applications', applicationId] })
		},
	})
}
