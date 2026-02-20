import NewApplicationLink from '@/components/NewApplicationLink'
import PageHeader from '@/components/PageHeader'
import { QueryError, QueryLoading } from '@/components/QueryState'
import { ResponsiveApplicationView } from '@/components/dashboard'
import { Card, CardContent } from '@/components/ui/card'
import { useApplications } from '@/hooks/useApplications'

export default function JobBoard() {
	const { data: applications = [], isLoading, error } = useApplications()

	// Loading and error states
	if (isLoading) return <QueryLoading text="Loading applications..." />
	if (error) return <QueryError error={error} title="Unable to load applications" />

	return (
		<div className="space-y-6">
			{/* Header */}
			<PageHeader
				title="Pipeline"
				subtitle="Visualize your application pipeline."
				actions={[<NewApplicationLink size="default" />]}
			/>

			{/* Kanban Board */}
			<Card className="shadow-xl">
				<CardContent>
					<ResponsiveApplicationView applications={applications} />
				</CardContent>
			</Card>
		</div>
	)
}
