import { Edit, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ApplicationDetailsCard } from '@/components/ApplicationDetailsCard'
import PageHeader from '@/components/PageHeader'
import { StatusHistoryCard } from '@/components/StatusHistoryCard'
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
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useApplication, useDeleteApplication } from '@/hooks/useApplications'

export default function ApplicationView() {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()

	// All hooks must be called before any conditional returns
	const { data: application, isLoading, error } = useApplication(id ?? '')
	const deleteApplicationMutation = useDeleteApplication()

	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

	// Handle missing id - redirect to dashboard (after all hooks)
	if (!id) {
		return <Navigate to="/" replace />
	}

	if (isLoading) return <div className="p-8 text-center">Loading...</div>
	if (error || !application) return <div className="p-8 text-center text-destructive">Application not found</div>

	const onDeleteApplication = async () => {
		try {
			await deleteApplicationMutation.mutateAsync(id)
			navigate('/')
		} catch {
			// Error handled by mutation hook
		} finally {
			setIsDeleteDialogOpen(false)
		}
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<PageHeader
				title={application.company}
				subtitle={application.jobTitle}
				backUrl="/"
				actions={[
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
					/>,
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
							nativeButton={true}
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
									className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
									disabled={deleteApplicationMutation.isPending}
								>
									{deleteApplicationMutation.isPending ? 'Deleting...' : 'Delete'}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>,
				]}
			/>

			{/* Content Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left Column: Read-only Details */}
				<div className="lg:col-span-2 space-y-6">
					<ApplicationDetailsCard application={application} />
				</div>

				{/* Right Column: Status History */}
				<div className="space-y-6">
					<StatusHistoryCard application={application} />
				</div>
			</div>
		</div>
	)
}
