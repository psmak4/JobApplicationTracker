import { useQuery } from '@tanstack/react-query'
import apiClient from '../lib/api-client'
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
		queryKey: ['calendar', 'events', date],
		queryFn: () => fetchEvents(date),
		enabled: !!date && enabled,
		staleTime: 1000 * 60 * 5, // 5 minutes
		retry: false, // Don't retry if auth fails (e.g. not connected)
	})
}
