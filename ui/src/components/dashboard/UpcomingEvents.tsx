import { type EventItem, EventList } from '@/components/EventList'

export interface UpcomingEvent {
	id: string
	applicationId: string
	company: string
	jobTitle: string
	title: string
	startTime: string // ISO format
	url?: string
}

interface UpcomingEventsProps {
	events: UpcomingEvent[]
	onHoverApplication?: (applicationId: string | null) => void
}

/**
 * Dashboard component displaying upcoming calendar events across all applications
 * Uses the shared EventList component with application context
 */
export function UpcomingEvents({ events, onHoverApplication }: UpcomingEventsProps) {
	if (events.length === 0) return null

	// Transform to EventItem format for the shared EventList component
	const eventItems: EventItem[] = events.map((event) => ({
		id: event.id,
		title: event.title,
		startTime: event.startTime,
		url: event.url,
		applicationId: event.applicationId,
		company: event.company,
		jobTitle: event.jobTitle,
	}))

	return <EventList title="Upcoming Events" events={eventItems} onHoverApplication={onHoverApplication} />
}
