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
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
	if (events.length === 0) return null

	const eventItems: EventItem[] = events.map((event) => ({
		id: event.id,
		title: event.title,
		startTime: event.startTime,
		url: event.url,
		applicationId: event.applicationId,
		company: event.company,
		jobTitle: event.jobTitle,
	}))

	return <EventList title="Upcoming Events" events={eventItems} />
}
