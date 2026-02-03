import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import apiClient from '../lib/api-client'
import { calendarQueryKeys } from '../lib/queryKeys'
import type { ApiSuccessResponse } from '../types'

export interface CalendarEvent {
	id: string
	title: string
	description?: string
	start: string // ISO
	end: string // ISO
	url?: string
	location?: string
	isAllDay: boolean
}

// Helper to fetch events
const fetchEvents = async (date: string) => {
	const response = await apiClient.get<ApiSuccessResponse<CalendarEvent[]>>('/calendar/events', {
		params: {
			date,
			timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
		},
	})
	return response.data.data
}

export const useCalendarEvents = (date: string, enabled = false) => {
	return useQuery({
		queryKey: calendarQueryKeys.events(date),
		queryFn: () => fetchEvents(date),
		enabled: !!date && enabled,
		staleTime: 1000 * 60 * 5, // 5 minutes
		retry: false, // Don't retry if auth fails (e.g. not connected)
	})
}

export const useCalendarStatus = () => {
	return useQuery({
		queryKey: calendarQueryKeys.status,
		queryFn: async () => {
			const response = await apiClient.get<ApiSuccessResponse<{ connected: boolean }>>('/calendar/status')
			return response.data.data
		},
	})
}

export const useDisconnectCalendar = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async () => {
			await apiClient.delete('/calendar')
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: calendarQueryKeys.status })
			queryClient.invalidateQueries({ queryKey: calendarQueryKeys.eventsBase })
			toast.success('Calendar disconnected successfully')
		},
		onError: () => {
			toast.error('Failed to disconnect calendar')
		},
	})
}
