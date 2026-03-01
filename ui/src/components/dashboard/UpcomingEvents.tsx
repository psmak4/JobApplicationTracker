import { EventList } from '@/components/EventList'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from './EmptyState'

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
	if (events.length === 0) {
		return (
			<Card className="shadow-lg">
				<CardHeader className="pb-3">
					<CardTitle className="text-lg font-semibold">Upcoming Events</CardTitle>
				</CardHeader>
				<CardContent>
					<EmptyState variant="no-events" />
				</CardContent>
			</Card>
		)
	}

	return <EventList title="Upcoming Events" events={events} onHoverApplication={onHoverApplication} />
}
