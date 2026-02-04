import { Calendar, Check, ExternalLink, Loader2, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { APPLICATION_STATUS_OPTIONS } from '@/constants'
import { type CalendarEvent, useCalendarEvents } from '@/hooks/useCalendar'
import { useAddStatus, useDeleteStatus } from '@/hooks/useMutations'
import { formatDisplayDate } from '@/lib/utils'
import type { Application, ApplicationStatus } from '@/types'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface StatusHistoryCardProps {
	application: Application
}

/**
 * Status history card with timeline and ability to add/delete status entries
 */
export function StatusHistoryCard({ application }: StatusHistoryCardProps) {
	const addStatusMutation = useAddStatus(application.id)
	const deleteStatusMutation = useDeleteStatus(application.id)

	const [isNewStatusOpen, setIsNewStatusOpen] = useState(false)
	const [statusToDelete, setStatusToDelete] = useState<string | null>(null)

	// New Status State
	const [newStatus, setNewStatus] = useState<ApplicationStatus>('Applied')
	const [newStatusDate, setNewStatusDate] = useState(new Date().toLocaleDateString('en-CA'))
	const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

	// Fetch events when form is open and date is selected
	const {
		data: events,
		isLoading: isLoadingEvents,
		error: eventsError,
	} = useCalendarEvents(newStatusDate, isNewStatusOpen)

	const onAddStatus = async () => {
		try {
			await addStatusMutation.mutateAsync({
				status: newStatus,
				date: newStatusDate,
				// Include optional event data
				...(selectedEvent && {
					eventId: selectedEvent.id,
					eventTitle: selectedEvent.title,
					eventUrl: selectedEvent.url,
					eventStartTime: selectedEvent.start,
					eventEndTime: selectedEvent.end,
				}),
			})
			setIsNewStatusOpen(false)
			setSelectedEvent(null) // Reset selection
		} catch {
			// Error handled by mutation hook
		}
	}

	const onDeleteStatus = async () => {
		if (!statusToDelete) return
		try {
			await deleteStatusMutation.mutateAsync(statusToDelete)
		} catch {
			// Error handled by mutation hook
		} finally {
			setStatusToDelete(null)
		}
	}

	return (
		<>
			<Card className="rounded-md">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-lg font-medium">Status History</CardTitle>
					{!isNewStatusOpen ? (
						<Button size="sm" variant="outline" onClick={() => setIsNewStatusOpen(true)}>
							<Plus className="h-4 w-4 mr-2" />
							Update
						</Button>
					) : (
						<Button
							size="icon-sm"
							variant="outline"
							onClick={() => setIsNewStatusOpen(false)}
							aria-label="Close status form"
						>
							<X className="h-4 w-4" />
						</Button>
					)}
				</CardHeader>
				<CardContent>
					{isNewStatusOpen && (
						<div className="mb-6 p-4 border rounded-lg bg-muted/50 space-y-4">
							<h4 className="font-medium text-sm">Add New Status</h4>
							<div className="grid gap-4">
								<div className="grid gap-2">
									<FieldLabel htmlFor="status-select">Status</FieldLabel>
									<Select
										id="status-select"
										value={newStatus}
										onValueChange={(v) => setNewStatus(v as ApplicationStatus)}
									>
										<SelectTrigger className="w-full">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{APPLICATION_STATUS_OPTIONS.map((status) => (
												<SelectItem key={status} value={status}>
													{status}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="grid gap-2">
									<FieldLabel htmlFor="status-date-input">Date</FieldLabel>
									<Input
										id="status-date-input"
										type="date"
										value={newStatusDate}
										onChange={(e) => {
											setNewStatusDate(e.target.value)
											setSelectedEvent(null) // Reset selection on date change
										}}
									/>
								</div>

								{/* Calendar Events Selection */}
								<div className="grid gap-2">
									<h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
										Link Calendar Event (Optional)
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
									) : events && events.length > 0 ? (
										<div className="max-h-48 overflow-y-auto space-y-2 border rounded-md p-2 bg-background/50">
											{events.map((event) => (
												<button
													key={event.id}
													type="button"
													onClick={() =>
														setSelectedEvent(event === selectedEvent ? null : event)
													}
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
																? new Date(event.start).toLocaleTimeString([], {
																		hour: 'numeric',
																		minute: '2-digit',
																	})
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

								<Button onClick={onAddStatus} size="sm" disabled={addStatusMutation.isPending}>
									{addStatusMutation.isPending ? 'Saving...' : 'Save Status'}
								</Button>
							</div>
						</div>
					)}

					<div className="relative border-l border-muted ml-2 space-y-6">
						{application.statusHistory &&
							application.statusHistory.map((entry, index) => (
								<div key={entry.id} className="ml-4 relative group">
									<div
										className={`absolute -left-5.25 mt-1.5 h-2.5 w-2.5 rounded-full border border-background ${index === 0 ? 'bg-primary' : 'bg-muted-foreground'}`}
									/>
									<div className="flex items-start justify-between gap-2">
										<div className="flex flex-col gap-1.5 flex-1">
											<div className="flex flex-col gap-1">
												<span className="font-semibold text-sm">{entry.status}</span>
												<span className="text-xs text-muted-foreground">
													{formatDisplayDate(entry.date)}
												</span>
											</div>

											{/* Associated Calendar Event Chip */}
											{entry.eventTitle && entry.eventUrl && (
												<a
													href={entry.eventUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-start gap-3 p-2.5 max-w-sm rounded-md border border-border/50 bg-secondary/30 hover:bg-secondary/60 hover:border-primary/30 transition-all group/event"
												>
													{/* Time Box */}
													{entry.eventStartTime && (
														<div className="flex flex-col items-center justify-center min-w-14 px-1 py-1 bg-background rounded border text-xs font-medium text-muted-foreground whitespace-nowrap">
															<span>
																{new Date(entry.eventStartTime).toLocaleTimeString([], {
																	hour: 'numeric',
																	minute: '2-digit',
																})}
															</span>
														</div>
													)}

													{/* Event Details */}
													<div className="flex flex-col overflow-hidden text-left">
														<span className="text-sm font-medium truncate group-hover/event:text-primary transition-colors">
															{entry.eventTitle}
														</span>
														<span className="text-xs text-muted-foreground flex items-center gap-1">
															<Calendar className="h-3 w-3" />
															Google Calendar
														</span>
													</div>

													{/* External Link Icon */}
													<ExternalLink className="h-3 w-3 ml-auto text-muted-foreground/50 shrink-0" />
												</a>
											)}
										</div>
										{application.statusHistory && application.statusHistory.length > 1 && (
											<Button
												variant="ghost"
												size="icon"
												className="h-6 w-6 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive shrink-0"
												onClick={() => setStatusToDelete(entry.id)}
												aria-label={`Delete ${entry.status} status`}
											>
												<Trash2 className="h-3 w-3" />
											</Button>
										)}
									</div>
								</div>
							))}
					</div>
				</CardContent>
			</Card>

			{/* Delete Status Confirmation Dialog */}
			<AlertDialog open={!!statusToDelete} onOpenChange={(open) => !open && setStatusToDelete(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Status Entry?</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this status entry? This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={onDeleteStatus}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							disabled={deleteStatusMutation.isPending}
						>
							{deleteStatusMutation.isPending ? 'Deleting...' : 'Delete'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
