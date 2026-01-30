import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import apiClient from '../lib/api-client'
import { applicationQueryKeys } from '../lib/queryKeys'
import type { ApiSuccessResponse, ApplicationStatus } from '../types'

// Helper to extract data from API response
const extractData = <T>(response: ApiSuccessResponse<T>): T => response.data

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
			return extractData(response.data)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: applicationQueryKeys.all })
			toast.success('Application created successfully')
		},
		onError: (error: any) => {
			const message = error.response?.data?.error?.message || 'Failed to create application'
			toast.error('Error', { description: message })
		},
	})
}

export const useUpdateApplication = (id: string) => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (data: Partial<CreateApplicationData>) => {
			const response = await apiClient.put(`/applications/${id}`, data)
			return extractData(response.data)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: applicationQueryKeys.all })
			queryClient.invalidateQueries({ queryKey: applicationQueryKeys.detail(id) })
			toast.success('Application updated successfully')
		},
		onError: (error: any) => {
			const message = error.response?.data?.error?.message || 'Failed to update application'
			toast.error('Error', { description: message })
		},
	})
}

export const useAddStatus = (applicationId: string) => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (data: { status: ApplicationStatus; date: string }) => {
			const response = await apiClient.post(`/statuses/application/${applicationId}`, data)
			return extractData(response.data)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: applicationQueryKeys.detail(applicationId) })
			queryClient.invalidateQueries({ queryKey: applicationQueryKeys.all })
			toast.success('Status added successfully')
		},
		onError: (error: any) => {
			const message = error.response?.data?.error?.message || 'Failed to add status'
			toast.error('Error', { description: message })
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
			queryClient.invalidateQueries({ queryKey: applicationQueryKeys.detail(applicationId) })
			toast.success('Status deleted successfully')
		},
		onError: (error: any) => {
			const message = error.response?.data?.error?.message || 'Failed to delete status'
			toast.error('Error', { description: message })
		},
	})
}
