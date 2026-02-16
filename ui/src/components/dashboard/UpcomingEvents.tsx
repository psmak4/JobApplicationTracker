import { CalendarPlus } from 'lucide-react'
import { EventList } from '@/components/EventList'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-lg font-semibold">Upcoming Events</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-center text-center py-6 px-4">
						<div className="rounded-full bg-primary/10 p-3 mb-4">
							<CalendarPlus className="h-6 w-6 text-primary" />
						</div>
						<p className="text-sm font-medium mb-1">No upcoming events</p>
						<p className="text-xs text-muted-foreground max-w-[240px]">
							Add interviews or meetings from any application to see them here.
						</p>
					</div>
				</CardContent>
			</Card>
		)
	}

	return <EventList title="Upcoming Events" events={events} onHoverApplication={onHoverApplication} />
}
