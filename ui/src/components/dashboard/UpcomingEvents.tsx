import { Clock, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface UpcomingEvent {
	id: string // statusHistory ID
	applicationId: string
	company: string
	jobTitle: string
	eventTitle: string
	eventDate: string // ISO
	eventUrl?: string
	status: string
}

interface UpcomingEventsProps {
	events: UpcomingEvent[]
	onHoverApplication?: (applicationId: string | null) => void
}

export function UpcomingEvents({ events, onHoverApplication }: UpcomingEventsProps) {
	if (events.length === 0) return null

	// Group events by date
	const groupedEvents = events.reduce(
		(acc, event) => {
			const date = new Date(event.eventDate)
			// Use ISO date string (YYYY-MM-DD) as key for stable sorting/grouping
			const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

			if (!acc[dateKey]) {
				acc[dateKey] = {
					date: date,
					events: [],
				}
			}
			acc[dateKey].events.push(event)
			return acc
		},
		{} as Record<string, { date: Date; events: UpcomingEvent[] }>,
	)

	// Sort keys just in case (though input is sorted)
	const sortedDateKeys = Object.keys(groupedEvents).sort()

	const getDateHeader = (date: Date) => {
		const today = new Date()
		const tomorrow = new Date()
		tomorrow.setDate(today.getDate() + 1)

		if (date.toDateString() === today.toDateString()) return 'Today'
		if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'

		return date.toLocaleDateString(undefined, {
			weekday: 'long',
			month: 'long',
			day: 'numeric',
		})
	}

	return (
		<Card className="bg-card/50 backdrop-blur-sm">
			<CardHeader className="pb-3 flex flex-row items-center justify-between">
				<CardTitle className="text-lg font-semibold">Upcoming Events</CardTitle>
				<Badge variant="secondary" className="font-normal text-xs">
					{events.length} Scheduled
				</Badge>
			</CardHeader>
			<CardContent className="space-y-6">
				{sortedDateKeys.map((dateKey) => {
					const { date, events: dayEvents } = groupedEvents[dateKey]
					return (
						<div key={dateKey} className="space-y-2">
							{/* Date Header */}
							<h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
								{getDateHeader(date)}
							</h4>

							{/* Events List */}
							<div className="rounded-lg border bg-card divide-y">
								{dayEvents.map((event) => (
									<div
										key={event.id}
										className="group flex items-start gap-4 p-3 transition-colors hover:bg-muted/50"
										onMouseEnter={() => onHoverApplication?.(event.applicationId)}
										onMouseLeave={() => onHoverApplication?.(null)}
									>
										{/* Time */}
										<div className="w-16 shrink-0 text-xs font-medium text-muted-foreground text-right tabular-nums">
											{new Date(event.eventDate).toLocaleTimeString(undefined, {
												hour: 'numeric',
												minute: '2-digit',
											})}
										</div>

										{/* Event Info */}
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2">
												<span className="text-sm font-medium leading-none truncate block">
													{event.eventTitle || 'Scheduled Event'}
												</span>
											</div>
											<div className="text-xs text-muted-foreground truncate mt-1">
												<span className="font-medium text-foreground/80">{event.company}</span>
												{' • '}
												{event.jobTitle}
											</div>
										</div>

										{/* Actions */}
										<div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
											{event.eventUrl && (
												<a
													href={event.eventUrl}
													target="_blank"
													rel="noopener noreferrer"
													className={cn(
														buttonVariants({ variant: 'ghost', size: 'icon' }),
														'h-7 w-7 text-muted-foreground hover:text-primary',
													)}
													title="Open in Calendar"
												>
													<ExternalLink className="h-3.5 w-3.5" />
												</a>
											)}
											<Link
												to={`/applications/${event.applicationId}`}
												className={cn(
													buttonVariants({ variant: 'ghost', size: 'icon' }),
													'h-7 w-7 text-muted-foreground hover:text-primary',
												)}
												title="View Application"
											>
												<Clock className="h-3.5 w-3.5" />
											</Link>
										</div>
									</div>
								))}
							</div>
						</div>
					)
				})}
			</CardContent>
		</Card>
	)
}
