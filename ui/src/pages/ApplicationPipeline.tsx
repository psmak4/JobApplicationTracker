import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '@/components/PageHeader'
import { QueryError, QueryLoading } from '@/components/QueryState'
import { KanbanBoard } from '@/components/dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useApplicationPrefetch, useApplications } from '@/hooks/useApplications'
import { useAddStatusDynamic } from '@/hooks/useMutations'
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
			<PageHeader title="Application Pipeline" subtitle="Visualize your application pipeline." />

			{/* Kanban Board */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-lg font-semibold">Application Pipeline</CardTitle>
				</CardHeader>
				<CardContent>
					<KanbanBoard
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
