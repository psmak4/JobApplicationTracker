import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import apiClient, { extractData } from '@/lib/api-client'
import { getErrorMessage } from '@/lib/error-utils'
import { applicationQueryKeys } from '@/lib/queryKeys'
import type { Application, CalendarEventEntry, MutationError } from '@/types'

export interface CreateEventData {
	googleEventId?: string
	title: string
	url?: string
	startTime: string
	endTime?: string
}

export const useAddEvent = (applicationId: string) => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (data: CreateEventData) => {
			const response = await apiClient.post(`/events/application/${applicationId}`, data)
			return extractData(response.data) as CalendarEventEntry
		},
		onMutate: async (newData) => {
			await queryClient.cancelQueries({ queryKey: applicationQueryKeys.detail(applicationId) })
			await queryClient.cancelQueries({ queryKey: applicationQueryKeys.all })

			const previousApplication = queryClient.getQueryData<Application>(
				applicationQueryKeys.detail(applicationId),
			)

			const newEvent: CalendarEventEntry = {
				id: `temp-${Date.now()}`,
				applicationId,
				googleEventId: newData.googleEventId,
				title: newData.title,
				url: newData.url,
				startTime: newData.startTime,
				endTime: newData.endTime,
				createdAt: new Date().toISOString(),
			}

			queryClient.setQueryData<Application>(applicationQueryKeys.detail(applicationId), (old) => {
				if (!old) return undefined
				return {
					...old,
					calendarEvents: [newEvent, ...old.calendarEvents],
				}
			})

			return { previousApplication }
		},
		onSuccess: () => {
			toast.success('Event added successfully')
		},
		onError: (error: MutationError, _newData, context) => {
			if (context?.previousApplication) {
				queryClient.setQueryData(applicationQueryKeys.detail(applicationId), context.previousApplication)
			}
			toast.error('Error', { description: getErrorMessage(error, 'Failed to add event') })
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: applicationQueryKeys.detail(applicationId) })
			queryClient.invalidateQueries({ queryKey: applicationQueryKeys.all })
		},
	})
}

export const useDeleteEvent = (applicationId: string) => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (eventId: string) => {
			await apiClient.delete(`/events/${eventId}`)
		},
		onMutate: async (eventId) => {
			await queryClient.cancelQueries({ queryKey: applicationQueryKeys.detail(applicationId) })
			await queryClient.cancelQueries({ queryKey: applicationQueryKeys.all })

			const previousApplication = queryClient.getQueryData<Application>(
				applicationQueryKeys.detail(applicationId),
			)

			queryClient.setQueryData<Application>(applicationQueryKeys.detail(applicationId), (old) => {
				if (!old) return undefined
				return {
					...old,
					calendarEvents: old.calendarEvents.filter((event) => event.id !== eventId),
				}
			})

			return { previousApplication }
		},
		onSuccess: () => {
			toast.success('Event deleted successfully')
		},
		onError: (error: MutationError, _eventId, context) => {
			if (context?.previousApplication) {
				queryClient.setQueryData(applicationQueryKeys.detail(applicationId), context.previousApplication)
			}
			toast.error('Error', { description: getErrorMessage(error, 'Failed to delete event') })
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: applicationQueryKeys.detail(applicationId) })
			queryClient.invalidateQueries({ queryKey: applicationQueryKeys.all })
		},
	})
}
