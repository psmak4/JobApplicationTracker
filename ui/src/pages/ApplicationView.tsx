import { Edit } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ApplicationDetailsCard } from '@/components/ApplicationDetailsCard'
import { EventsCard } from '@/components/EventsCard'
import PageHeader from '@/components/PageHeader'
import { QueryError, QueryLoading } from '@/components/QueryState'
import { StatusHistoryCard } from '@/components/StatusHistoryCard'
import { Button } from '@/components/ui/button'
import { useApplication } from '@/hooks/useApplications'

export default function ApplicationView() {
	const { id } = useParams<{ id: string }>()

	// All hooks must be called before any conditional returns
	const { data: application, isLoading, error } = useApplication(id ?? '')

	// Handle missing id - redirect to dashboard (after all hooks)
	if (!id) {
		return <Navigate to="/" replace />
	}

	if (isLoading) return <QueryLoading />
	if (error) return <QueryError error={error} title="Unable to load application" />
	if (!application) return <QueryError title="Application not found" message="This application no longer exists." />

	return (
		<div className="space-y-6">
			{/* Header */}
			<PageHeader
				title={application.company}
				subtitle={application.jobTitle}
				backUrl="/pipeline"
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
				]}
			/>

			{/* Content Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left Column: Read-only Details */}
				<div className="lg:col-span-2">
					<ApplicationDetailsCard application={application} />
				</div>

				{/* Right Column: Status History & Events */}
				<div className="flex flex-col gap-6">
					<EventsCard application={application} />
					<StatusHistoryCard application={application} />
				</div>
			</div>
		</div>
	)
}
