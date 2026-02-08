import { Plus } from 'lucide-react'
import { useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageHeader from '@/components/PageHeader'
import { QueryError, QueryLoading } from '@/components/QueryState'
import { ResponsiveApplicationView } from '@/components/dashboard'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useApplicationPrefetch, useApplications } from '@/hooks/useApplications'
import { useAddStatusDynamic } from '@/hooks/useMutations'
import { cn } from '@/lib/utils'
import type { ApplicationStatus } from '@/types'

export default function JobBoard() {
	const navigate = useNavigate()
	const { data: applications = [], isLoading, error } = useApplications()
	const prefetchApplication = useApplicationPrefetch()
	const addStatusMutation = useAddStatusDynamic()

	// Navigation handlers
	const handleNavigate = useCallback(
		(id: string) => {
			navigate(`/applications/${id}`)
		},
		[navigate],
	)

	const handlePrefetch = useCallback(
		(id: string) => {
			prefetchApplication(id)
		},
		[prefetchApplication],
	)

	// Status change handler for kanban board
	const handleStatusChange = useCallback(
		(applicationId: string, newStatus: ApplicationStatus) => {
			const today = new Date().toLocaleDateString('en-CA')
			addStatusMutation.mutate({ applicationId, status: newStatus, date: today })
		},
		[addStatusMutation],
	)

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
						className={cn(buttonVariants({ variant: 'default' }), 'flex items-center gap-2')}
						aria-label="Create new application"
					>
						<Plus className="h-4 w-4" /> New Application
					</Link>,
				]}
			/>

			{/* Kanban Board */}
			<Card>
				<CardContent>
					<ResponsiveApplicationView
						applications={applications}
						onNavigate={handleNavigate}
						onPrefetch={handlePrefetch}
						onStatusChange={handleStatusChange}
					/>
				</CardContent>
			</Card>
		</div>
	)
}
