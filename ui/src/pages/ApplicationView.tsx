import {
	ArrowLeft,
	Briefcase,
	DollarSign,
	Edit,
	ExternalLink,
	FileText,
	MapPin,
	Plus,
	Trash2,
	User,
	X,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '../components/ui/alert-dialog'
import { Badge } from '../components/ui/badge'
import { Button, buttonVariants } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { FieldLabel } from '../components/ui/field'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { useApplication, useDeleteApplication } from '../hooks/useApplications'
import { useAddStatus, useDeleteStatus } from '../hooks/useMutations'
import { formatDisplayDate } from '../lib/utils'
import type { ApplicationStatus } from '../types'

export default function ApplicationView() {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()

	const { data: application, isLoading, error } = useApplication(id!)
	const deleteApplicationMutation = useDeleteApplication()
	const addStatusMutation = useAddStatus(id!)
	const deleteStatusMutation = useDeleteStatus(id!)

	const [isNewStatusOpen, setIsNewStatusOpen] = useState(false)
	const [statusToDelete, setStatusToDelete] = useState<string | null>(null)
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

	// New Status State
	const [newStatus, setNewStatus] = useState<ApplicationStatus>('Applied')
	const [newStatusDate, setNewStatusDate] = useState(new Date().toLocaleDateString('en-CA'))

	if (isLoading) return <div className="p-8 text-center">Loading...</div>
	if (error || !application) return <div className="p-8 text-center text-destructive">Application not found</div>

	const onAddStatus = async () => {
		try {
			await addStatusMutation.mutateAsync({
				status: newStatus,
				date: newStatusDate,
			})
			setIsNewStatusOpen(false)
			toast.success('Status history updated!')
		} catch {
			toast.error('Failed to update status')
		}
	}

	const onDeleteStatus = async () => {
		if (!statusToDelete) return
		try {
			await deleteStatusMutation.mutateAsync(statusToDelete)
			toast.success('Status entry deleted.')
		} catch (err: unknown) {
			const error = err as { response?: { data?: { message?: string } } }
			toast.error(error.response?.data?.message || 'Failed to delete status entry')
		} finally {
			setStatusToDelete(null)
		}
	}

	const onDeleteApplication = async () => {
		try {
			await deleteApplicationMutation.mutateAsync(id!)
			toast.success('Application deleted successfully')
			navigate('/')
		} catch {
			toast.error('Failed to delete application')
		} finally {
			setIsDeleteDialogOpen(false)
		}
	}

	const currentStatus =
		application.statusHistory && application.statusHistory.length > 0
			? application.statusHistory[0].status // Backend returns sorted desc
			: 'Unknown'

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" onClick={() => navigate('/')}>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div>
					<div className="flex items-center gap-3">
						<h1 className="text-2xl font-bold tracking-tight">{application.company}</h1>
						<Badge variant="outline">{currentStatus}</Badge>
					</div>
					<p className="text-muted-foreground">{application.jobTitle}</p>
				</div>
				<div className="ml-auto flex items-center gap-2">
					<Link
						to={`/applications/${application.id}/edit`}
						className={buttonVariants({ variant: 'outline', size: 'sm' })}
					>
						<Edit className="h-4 w-4 mr-2" />
						Edit
					</Link>

					<AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
						<AlertDialogTrigger
							render={
								<Button
									variant="outline"
									size="sm"
									className="text-destructive hover:text-destructive hover:bg-destructive/10"
								>
									<Trash2 className="h-4 w-4 mr-2" />
									Delete
								</Button>
							}
						/>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Delete Application?</AlertDialogTitle>
								<AlertDialogDescription>
									This will permanently delete the application for{' '}
									<strong>{application.company}</strong>. This action cannot be undone.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction
									onClick={onDeleteApplication}
									className="bg-destructive text-(--destructive-foreground) hover:bg-destructive/90"
									disabled={deleteApplicationMutation.isPending}
								>
									{deleteApplicationMutation.isPending ? 'Deleting...' : 'Delete'}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left Column: Read-only Details */}
				<div className="lg:col-span-2 space-y-6">
					<Card className="rounded-md">
						<CardHeader>
							<CardTitle>Application Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-1">
									<span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
										<Briefcase className="h-4 w-4" /> Job Title
									</span>
									<p className="font-medium">{application.jobTitle}</p>
								</div>
								<div className="space-y-1">
									<span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
										<Briefcase className="h-4 w-4" /> Company
									</span>
									<p className="font-medium">{application.company}</p>
								</div>
								{application.salary && (
									<div className="space-y-1">
										<span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
											<DollarSign className="h-4 w-4" /> Salary
										</span>
										<p>{application.salary}</p>
									</div>
								)}
								{application.workType && (
									<div className="space-y-1">
										<span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
											<MapPin className="h-4 w-4" /> Work Type
										</span>
										<p>{application.workType}</p>
									</div>
								)}
								{application.location && (
									<div className="space-y-1">
										<span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
											<MapPin className="h-4 w-4" /> Location
										</span>
										<p>{application.location}</p>
									</div>
								)}
								{application.contactInfo && (
									<div className="space-y-1">
										<span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
											<User className="h-4 w-4" /> Contact
										</span>
										<p>{application.contactInfo}</p>
									</div>
								)}
							</div>

							{application.jobDescriptionUrl && (
								<div className="space-y-1">
									<span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
										<ExternalLink className="h-4 w-4" /> Job Description
									</span>
									<a
										href={application.jobDescriptionUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="text-primary hover:underline break-all"
									>
										{application.jobDescriptionUrl}
									</a>
								</div>
							)}

							{application.notes && (
								<div className="space-y-1">
									<span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
										<FileText className="h-4 w-4" /> Notes
									</span>
									<div className="p-4 bg-muted/30 rounded-lg whitespace-pre-wrap text-sm">
										{application.notes}
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Right Column: Status History */}
				<div className="space-y-6">
					<Card className="rounded-md">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-lg font-medium">Status History</CardTitle>
							{!isNewStatusOpen ? (
								<Button size="sm" variant="outline" onClick={() => setIsNewStatusOpen(true)}>
									<Plus className="h-4 w-4 mr-2" />
									Update
								</Button>
							) : (
								<Button size="sm" variant="ghost" onClick={() => setIsNewStatusOpen(false)}>
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
											<FieldLabel>Status</FieldLabel>
											<Select
												value={newStatus}
												onValueChange={(v) => setNewStatus(v as ApplicationStatus)}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="Applied">Applied</SelectItem>
													<SelectItem value="Phone Screen">Phone Screen</SelectItem>
													<SelectItem value="Technical Interview">
														Technical Interview
													</SelectItem>
													<SelectItem value="On-site Interview">On-site Interview</SelectItem>
													<SelectItem value="Offer">Offer</SelectItem>
													<SelectItem value="Rejected">Rejected</SelectItem>
													<SelectItem value="Withdrawn">Withdrawn</SelectItem>
													<SelectItem value="Other">Other</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div className="grid gap-2">
											<FieldLabel>Date</FieldLabel>
											<Input
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
											<div className="flex items-center justify-between gap-2">
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
														className="h-6 w-6 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
														onClick={() => setStatusToDelete(entry.id)}
													>
														<Trash2 className="h-3 w-3" />
														<span className="sr-only">Delete</span>
													</Button>
												)}
											</div>
										</div>
									))}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

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
							className="bg-destructive text-(--destructive-foreground) hover:bg-destructive/90"
							disabled={deleteStatusMutation.isPending}
						>
							{deleteStatusMutation.isPending ? 'Deleting...' : 'Delete'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
