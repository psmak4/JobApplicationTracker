import { ExternalLink, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn, formatDate } from '@/lib/utils'

export interface EventItem {
	id: string
	title: string
	startTime: string // ISO format
	url?: string
	// Optional fields for dashboard context
	applicationId?: string
	company?: string
	jobTitle?: string
}

interface EventListProps {
	title: string
	events: EventItem[]
	emptyMessage?: string
	onDelete?: (eventId: string) => void
	onHoverApplication?: (applicationId: string | null) => void
	headerAction?: React.ReactNode
	className?: string
}

/**
 * Reusable event list component with date grouping
 * Used by both Dashboard (UpcomingEvents) and ApplicationView (EventsCard)
 */
export function EventList({
	title,
	events,
	emptyMessage = 'No events scheduled.',
	onDelete,
	onHoverApplication,
	headerAction,
	className,
}: EventListProps) {
	if (events.length === 0 && !headerAction) {
		return (
			<Card className={className}>
				<CardHeader className="pb-3">
					<CardTitle className="text-lg font-semibold">{title}</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground text-center py-4">{emptyMessage}</p>
				</CardContent>
			</Card>
		)
	}

	// Group events by date
	const groupedEvents = events.reduce(
		(acc, event) => {
			const date = new Date(event.startTime)
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
		{} as Record<string, { date: Date; events: EventItem[] }>,
	)

	const sortedDateKeys = Object.keys(groupedEvents).sort()

	const getDateHeader = (date: Date) => {
		const today = new Date()
		const tomorrow = new Date()
		tomorrow.setDate(today.getDate() + 1)

		if (date.toDateString() === today.toDateString()) return 'Today'
		if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'

		return formatDate(date, 'weekday')
	}

	return (
		<Card className="shadow-xl">
			<CardHeader className="pb-3 flex flex-row items-center justify-between">
				<CardTitle className="text-lg font-semibold">{title}</CardTitle>
				{headerAction ? (
					headerAction
				) : (
					<Badge variant="secondary" className="font-normal text-xs">
						{events.length} Scheduled
					</Badge>
				)}
			</CardHeader>
			<CardContent className="space-y-6">
				{events.length === 0 ? (
					<p className="text-sm text-muted-foreground text-center py-4">{emptyMessage}</p>
				) : (
					sortedDateKeys.map((dateKey) => {
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
											className="group flex items-center gap-4 p-3 transition-colors hover:bg-muted/50"
											onMouseEnter={() => onHoverApplication?.(event.applicationId ?? null)}
											onMouseLeave={() => onHoverApplication?.(null)}
										>
											{/* Time */}
											<div className="w-16 shrink-0 text-xs font-medium text-muted-foreground text-right tabular-nums">
												{formatDate(event.startTime, 'time')}
											</div>

											{/* Event Info */}
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2">
													<span className="text-sm font-medium leading-none truncate block">
														{event.title || 'Scheduled Event'}
													</span>
												</div>
												{event.company && (
													<div className="text-xs text-muted-foreground truncate mt-1">
														<span className="font-medium text-foreground/80">
															{event.company}
														</span>
														{event.jobTitle && ` • ${event.jobTitle}`}
													</div>
												)}
											</div>

											{/* Actions */}
											<div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
												{event.url && (
													<a
														href={event.url}
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
												{onDelete && (
													<Button
														variant="ghost"
														size="icon"
														className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
														onClick={() => onDelete(event.id)}
														aria-label={`Delete ${event.title} event`}
													>
														<Trash2 className="h-3.5 w-3.5" />
													</Button>
												)}
											</div>
										</div>
									))}
								</div>
							</div>
						)
					})
				)}
			</CardContent>
		</Card>
	)
}
