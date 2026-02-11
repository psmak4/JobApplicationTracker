import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHeader from '@/components/PageHeader'
import { QueryError, QueryLoading } from '@/components/QueryState'
import { ResponsiveApplicationView } from '@/components/dashboard'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useApplications } from '@/hooks/useApplications'
import { cn } from '@/lib/utils'

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
				actions={[
					<Link
						to="/new"
						className={cn(
							buttonVariants({ variant: 'default' }),
							'flex items-center gap-2 group transition-all duration-300 hover:scale-105 hover:shadow-lg',
						)}
						aria-label="Create new application"
					>
						<Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" /> New
						Application
					</Link>,
				]}
			/>

			{/* Kanban Board */}
			<Card>
				<CardContent>
					<ResponsiveApplicationView applications={applications} />
				</CardContent>
			</Card>
		</div>
	)
}
