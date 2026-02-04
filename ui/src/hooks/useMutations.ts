import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import apiClient, { extractData } from '@/lib/api-client'
import { applicationQueryKeys } from '@/lib/queryKeys'
import type { Application, ApplicationStatus, MutationError, StatusHistoryEntry, WorkType } from '@/types'

export interface CreateApplicationData {
	company: string
	jobTitle: string
	jobDescriptionUrl?: string
	salary?: string
	location?: string
	workType?: WorkType
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
		onError: (error: MutationError) => {
			const message =
				('response' in error && error.response?.data?.error?.message) ||
				error.message ||
				'Failed to create application'
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
		onMutate: async (newData) => {
			await queryClient.cancelQueries({ queryKey: applicationQueryKeys.detail(id) })
			const previousApplication = queryClient.getQueryData<Application>(applicationQueryKeys.detail(id))
			queryClient.setQueryData<Application>(applicationQueryKeys.detail(id), (old) => {
				if (!old) return undefined
				// Filter out fields that don't exist on Application type
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const { status, date, ...validUpdates } = newData
				return { ...old, ...validUpdates }
			})
			return { previousApplication }
		},
		onSuccess: () => {
			toast.success('Application updated successfully')
		},
		onError: (error: MutationError, _newData, context) => {
			if (context?.previousApplication) {
				queryClient.setQueryData(applicationQueryKeys.detail(id), context.previousApplication)
			}
			const message =
				('response' in error && error.response?.data?.error?.message) ||
				error.message ||
				'Failed to update application'
			toast.error('Error', { description: message })
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: applicationQueryKeys.all })
			queryClient.invalidateQueries({ queryKey: applicationQueryKeys.detail(id) })
		},
	})
}

export const useAddStatus = (applicationId: string) => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (data: {
			status: ApplicationStatus
			date: string
			eventId?: string
			eventTitle?: string
			eventUrl?: string
			eventStartTime?: string
			eventEndTime?: string
		}) => {
			const response = await apiClient.post(`/statuses/application/${applicationId}`, data)
			return extractData(response.data)
		},
		onMutate: async (newData) => {
			await queryClient.cancelQueries({ queryKey: applicationQueryKeys.detail(applicationId) })
			const previousApplication = queryClient.getQueryData<Application>(
				applicationQueryKeys.detail(applicationId),
			)
			queryClient.setQueryData<Application>(applicationQueryKeys.detail(applicationId), (old) => {
				if (!old) return undefined
				const newStatusEntry: StatusHistoryEntry = {
					id: `temp-${Date.now()}`,
					status: newData.status,
					date: newData.date,
					createdAt: new Date().toISOString(),
					eventId: newData.eventId,
					eventTitle: newData.eventTitle,
					eventUrl: newData.eventUrl,
					eventStartTime: newData.eventStartTime,
					eventEndTime: newData.eventEndTime,
				}
				// Prepend new status
				return { ...old, statusHistory: [newStatusEntry, ...old.statusHistory] }
			})
			return { previousApplication }
		},
		onSuccess: () => {
			toast.success('Status added successfully')
		},
		onError: (error: MutationError, _newData, context) => {
			if (context?.previousApplication) {
				queryClient.setQueryData(applicationQueryKeys.detail(applicationId), context.previousApplication)
			}
			const message =
				('response' in error && error.response?.data?.error?.message) || error.message || 'Failed to add status'
			toast.error('Error', { description: message })
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: applicationQueryKeys.detail(applicationId) })
			queryClient.invalidateQueries({ queryKey: applicationQueryKeys.all })
		},
	})
}

export const useDeleteStatus = (applicationId: string) => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (statusId: string) => {
			await apiClient.delete(`/statuses/${statusId}`)
		},
		onMutate: async (statusId) => {
			await queryClient.cancelQueries({ queryKey: applicationQueryKeys.detail(applicationId) })
			const previousApplication = queryClient.getQueryData<Application>(
				applicationQueryKeys.detail(applicationId),
			)
			queryClient.setQueryData<Application>(applicationQueryKeys.detail(applicationId), (old) => {
				if (!old) return undefined
				return {
					...old,
					statusHistory: old.statusHistory.filter((status) => status.id !== statusId),
				}
			})
			return { previousApplication }
		},
		onSuccess: () => {
			toast.success('Status deleted successfully')
		},
		onError: (error: MutationError, _statusId, context) => {
			if (context?.previousApplication) {
				queryClient.setQueryData(applicationQueryKeys.detail(applicationId), context.previousApplication)
			}
			const message =
				('response' in error && error.response?.data?.error?.message) ||
				error.message ||
				'Failed to delete status'
			toast.error('Error', { description: message })
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: applicationQueryKeys.detail(applicationId) })
		},
	})
}
