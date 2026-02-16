import { EventList } from '@/components/EventList'

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
	return (
		<EventList
			title="Upcoming Events"
			events={events}
			onHoverApplication={onHoverApplication}
			emptyMessage="No upcoming events. Add interviews or meetings to your applications to see them here."
		/>
	)
}
