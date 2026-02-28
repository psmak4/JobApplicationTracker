import { Calendar } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { groupEventsByDate } from '@/lib/action-dashboard-utils'
import { formatDate } from '@/lib/utils'
import type { UpcomingEventWithApp } from '@/types'

interface Props {
	events: UpcomingEventWithApp[]
}

export function ComingUpCard({ events }: Props) {
	const navigate = useNavigate()
	const grouped = useMemo(() => groupEventsByDate(events), [events])

	if (events.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<Calendar className="h-5 w-5" />
						Coming Up
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">No upcoming events in the next 7 days.</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<Calendar className="h-5 w-5" />
					Coming Up
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{grouped.today.length > 0 && (
					<EventSection
						title="TODAY"
						events={grouped.today}
						onEventClick={(id) => navigate(`/applications/${id}`)}
					/>
				)}
				{grouped.tomorrow.length > 0 && (
					<EventSection
						title="TOMORROW"
						events={grouped.tomorrow}
						onEventClick={(id) => navigate(`/applications/${id}`)}
					/>
				)}
				{grouped.thisWeek.length > 0 && (
					<EventSection
						title="THIS WEEK"
						events={grouped.thisWeek}
						onEventClick={(id) => navigate(`/applications/${id}`)}
					/>
				)}
			</CardContent>
		</Card>
	)
}

function EventSection({
	title,
	events,
	onEventClick,
}: {
	title: string
	events: UpcomingEventWithApp[]
	onEventClick: (id: string) => void
}) {
	return (
		<div>
			<h4 className="text-xs font-semibold text-muted-foreground mb-2">{title}</h4>
			<div className="space-y-2">
				{events.map((event) => (
					<div
						key={event.id}
						onClick={() => onEventClick(event.applicationId)}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault()
								onEventClick(event.applicationId)
							}
						}}
						role="button"
						tabIndex={0}
						aria-label={`${event.title} - ${event.company}`}
						className="p-2 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
					>
						<p className="text-sm font-medium">
							{formatDate(event.startTime, 'time')} • {event.title}
						</p>
						<p className="text-xs text-muted-foreground">
							{event.company} – {event.jobTitle}
						</p>
					</div>
				))}
			</div>
		</div>
	)
}
