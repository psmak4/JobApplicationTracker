import { Archive, Edit } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ApplicationDetailsCard } from '@/components/ApplicationDetailsCard'
import { ApplicationHero } from '@/components/ApplicationHero'
import { EventsCard } from '@/components/EventsCard'
import { QueryError, QueryLoading } from '@/components/QueryState'
import { StatusTimeline } from '@/components/StatusTimeline'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useApplication } from '@/hooks/useApplications'
import { useArchiveApplication } from '@/hooks/useMutations'

export default function ApplicationView() {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()

	// All hooks must be called before any conditional returns
	const { data: application, isLoading, error } = useApplication(id ?? '')
	const archiveApplicationMutation = useArchiveApplication()
	const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)

	// Handle missing id - redirect to dashboard (after all hooks)
	if (!id) {
		return <Navigate to="/" replace />
	}

	if (isLoading) return <QueryLoading />
	if (error) return <QueryError error={error} title="Unable to load application" />
	if (!application) return <QueryError title="Application not found" message="This application no longer exists." />

	const onArchiveApplication = async () => {
		try {
			await archiveApplicationMutation.mutateAsync(id)
			navigate('/pipeline')
		} catch {
			// Error handled by mutation hook
		} finally {
			setIsArchiveDialogOpen(false)
		}
	}

	return (
		<div className="space-y-6">
			{/* Hero Section */}
			<ApplicationHero
				application={application}
				actions={
					<>
						<Button
							render={
								<Link to={`/applications/${application.id}/edit`}>
									<Edit className="h-4 w-4 mr-2" />
									Edit
								</Link>
							}
							variant="outline"
							size="sm"
							aria-label="Edit application"
							nativeButton={false}
						/>
						<AlertDialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
							<Button variant="outline" size="sm" onClick={() => setIsArchiveDialogOpen(true)}>
								<Archive className="h-4 w-4 mr-2" />
								Archive
							</Button>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Archive Application?</AlertDialogTitle>
									<AlertDialogDescription>
										This will mark the application for <strong>{application.company}</strong> as
										archived and remove it from your active views. You can restore it later from the
										archive.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction
										onClick={onArchiveApplication}
										disabled={archiveApplicationMutation.isPending}
									>
										{archiveApplicationMutation.isPending ? 'Archiving...' : 'Archive Application'}
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</>
				}
			/>

			{/* Status Timeline */}
			<StatusTimeline status={application.status} />

			{/* Content Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left Column: Read-only Details */}
				<div className="lg:col-span-2">
					<ApplicationDetailsCard application={application} />
				</div>

				{/* Right Column: Events */}
				<div className="flex flex-col gap-6">
					<EventsCard application={application} />
				</div>
			</div>
		</div>
	)
}
