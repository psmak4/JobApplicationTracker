import { Calendar, Check, Loader2, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { type EventItem, EventList } from '@/components/EventList'
import { type CalendarEvent, useCalendarEvents } from '@/hooks/useCalendar'
import { useAddEvent, useDeleteEvent } from '@/hooks/useEvents'
import { formatDate } from '@/lib/utils'
import type { Application } from '@/types'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from './ui/alert-dialog'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { FieldLabel } from './ui/field'
import { Input } from './ui/input'

interface EventsCardProps {
	application: Application
}

/**
 * Calendar events card for application detail page
 * Allows adding and removing calendar events linked to the application
 */
export function EventsCard({ application }: EventsCardProps) {
	const addEventMutation = useAddEvent(application.id)
	const deleteEventMutation = useDeleteEvent(application.id)

	const [isAddingEvent, setIsAddingEvent] = useState(false)
	const [eventToDelete, setEventToDelete] = useState<string | null>(null)

	// Form state for adding events
	const [eventDate, setEventDate] = useState(new Date().toLocaleDateString('en-CA'))
	const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

	// Fetch Google Calendar events when form is open
	const {
		data: googleEvents,
		isLoading: isLoadingEvents,
		error: eventsError,
	} = useCalendarEvents(eventDate, isAddingEvent)

	const onAddEvent = async () => {
		if (!selectedEvent) return

		try {
			await addEventMutation.mutateAsync({
				googleEventId: selectedEvent.id,
				title: selectedEvent.title,
				url: selectedEvent.url,
				startTime: selectedEvent.start,
				endTime: selectedEvent.end,
			})
			setIsAddingEvent(false)
			setSelectedEvent(null)
		} catch {
			// Error handled by mutation hook
		}
	}

	const onDeleteEvent = async () => {
		if (!eventToDelete) return
		try {
			await deleteEventMutation.mutateAsync(eventToDelete)
		} catch {
			// Error handled by mutation hook
		} finally {
			setEventToDelete(null)
		}
	}

	const calendarEvents = application.calendarEvents || []

	// Transform to EventItem format for the shared EventList component
	const eventItems: EventItem[] = calendarEvents.map((event) => ({
		id: event.id,
		title: event.title,
		startTime: event.startTime,
		url: event.url,
	}))

	// If adding event, show the add form card instead of EventList
	if (isAddingEvent) {
		return (
			<Card>
				<CardHeader className="pb-3 flex flex-row items-center justify-between">
					<CardTitle className="text-lg font-semibold">Calendar Events</CardTitle>
					<Button
						size="icon-sm"
						variant="outline"
						onClick={() => setIsAddingEvent(false)}
						aria-label="Close event form"
					>
						<X className="h-4 w-4" />
					</Button>
				</CardHeader>
				<CardContent>
					<div className="p-4 border rounded-lg bg-muted/50 space-y-4">
						<h4 className="font-medium text-sm">Link Calendar Event</h4>
						<div className="grid gap-4">
							<div className="grid gap-2">
								<FieldLabel htmlFor="event-date-input">Select Date</FieldLabel>
								<Input
									id="event-date-input"
									type="date"
									value={eventDate}
									onChange={(e) => {
										setEventDate(e.target.value)
										setSelectedEvent(null)
									}}
								/>
							</div>

							{/* Google Calendar Events Selection */}
							<div className="grid gap-2">
								<h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
									Available Events
								</h5>

								{isLoadingEvents ? (
									<div className="flex items-center justify-center p-4 border rounded-md bg-background/50">
										<Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
										<span className="text-sm text-muted-foreground">Loading calendar...</span>
									</div>
								) : eventsError ? (
									<div className="p-3 border rounded-md bg-background/50 text-sm">
										{/* @ts-expect-error - Error type is not fully typed but we know structure */}
										{eventsError?.response?.data?.code === 'GOOGLE_NOT_CONNECTED' ? (
											<div className="text-muted-foreground">
												<p>Connect Google Calendar to link events.</p>
												<Link
													to="/profile"
													className="text-primary hover:underline font-medium mt-1 inline-block"
												>
													Go to Profile settings &rarr;
												</Link>
											</div>
										) : (
											<span className="text-destructive">Failed to load events.</span>
										)}
									</div>
								) : googleEvents && googleEvents.length > 0 ? (
									<div className="max-h-48 overflow-y-auto space-y-2 border rounded-md p-2 bg-background/50">
										{googleEvents.map((event) => (
											<button
												key={event.id}
												type="button"
												onClick={() => setSelectedEvent(event === selectedEvent ? null : event)}
												className={`w-full text-left p-2.5 rounded-md border text-sm transition-all flex items-start gap-3 ${
													selectedEvent?.id === event.id
														? 'bg-primary/10 border-primary shadow-sm'
														: 'bg-background hover:border-primary/50'
												}`}
											>
												<div
													className={`p-1 rounded shrink-0 ${selectedEvent?.id === event.id ? 'text-primary' : 'text-muted-foreground'}`}
												>
													{selectedEvent?.id === event.id ? (
														<Check className="h-4 w-4" />
													) : (
														<Calendar className="h-4 w-4" />
													)}
												</div>
												<div className="flex-1 min-w-0">
													<div className="font-medium truncate">{event.title}</div>
													<div className="text-xs text-muted-foreground">
														{!event.isAllDay && event.start
															? formatDate(event.start, 'time')
															: 'All Day'}
													</div>
												</div>
											</button>
										))}
									</div>
								) : (
									<div className="p-3 border rounded-md bg-background/50 text-sm text-muted-foreground text-center">
										No events found for this date.
									</div>
								)}
							</div>

							<Button
								onClick={onAddEvent}
								size="sm"
								disabled={!selectedEvent || addEventMutation.isPending}
							>
								{addEventMutation.isPending ? 'Adding...' : 'Add Event'}
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<>
			<EventList
				title="Calendar Events"
				events={eventItems}
				emptyMessage="No calendar events linked to this application."
				onDelete={setEventToDelete}
				headerAction={
					<Button size="sm" variant="outline" onClick={() => setIsAddingEvent(true)}>
						<Plus className="h-4 w-4 mr-2" />
						Add Event
					</Button>
				}
				className="rounded-md"
			/>

			{/* Delete Event Confirmation Dialog */}
			<AlertDialog open={!!eventToDelete} onOpenChange={(open) => !open && setEventToDelete(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Remove Calendar Event?</AlertDialogTitle>
						<AlertDialogDescription>
							This will unlink the event from this application. The event will remain in your Google
							Calendar.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={onDeleteEvent}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							disabled={deleteEventMutation.isPending}
						>
							{deleteEventMutation.isPending ? 'Removing...' : 'Remove'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
