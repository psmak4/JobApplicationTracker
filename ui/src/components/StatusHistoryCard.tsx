import { Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { APPLICATION_STATUS_OPTIONS } from '@/constants'
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
 * (Event linking has been moved to a separate EventsCard component)
 */
export function StatusHistoryCard({ application }: StatusHistoryCardProps) {
	const addStatusMutation = useAddStatus(application.id)
	const deleteStatusMutation = useDeleteStatus(application.id)

	const [isNewStatusOpen, setIsNewStatusOpen] = useState(false)
	const [statusToDelete, setStatusToDelete] = useState<string | null>(null)

	// New Status State
	const [newStatus, setNewStatus] = useState<ApplicationStatus>('Applied')
	const [newStatusDate, setNewStatusDate] = useState(new Date().toLocaleDateString('en-CA'))

	const onAddStatus = async () => {
		try {
			await addStatusMutation.mutateAsync({
				status: newStatus,
				date: newStatusDate,
			})
			setIsNewStatusOpen(false)
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
			<Card>
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
										onChange={(e) => setNewStatusDate(e.target.value)}
									/>
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
										<div className="flex flex-col gap-1">
											<span className="font-semibold text-sm">{entry.status}</span>
											<span className="text-xs text-muted-foreground">
												{formatDisplayDate(entry.date)}
											</span>
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
