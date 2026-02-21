import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NewApplicationLink from '@/components/NewApplicationLink'
import PageHeader from '@/components/PageHeader'
import { QueryError, QueryLoading } from '@/components/QueryState'
import { ApplicationList, EmptyState, UpcomingEvents } from '@/components/dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useActiveApplications, useApplicationPrefetch } from '@/hooks/useApplications'

export default function Dashboard() {
	const navigate = useNavigate()
	const { data: applications = [], isLoading, error } = useActiveApplications()
	const prefetchApplication = useApplicationPrefetch()
	const [highlightedApplicationId, setHighlightedApplicationId] = useState<string | null>(null)

	// Derived data - upcoming events from all applications
	const upcomingEvents = useMemo(() => {
		const events = applications.flatMap((app) =>
			(app.upcomingEvents || [])
				.filter((entry) => entry.startTime)
				.map((entry) => ({
					id: entry.id,
					applicationId: app.id,
					company: app.company,
					jobTitle: app.jobTitle,
					title: entry.title || 'Scheduled Event',
					startTime: entry.startTime,
					url: entry.url,
				})),
		)
		return events.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
	}, [applications])

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

	// Loading and error states
	if (isLoading) return <QueryLoading text="Loading applications..." />
	if (error) return <QueryError error={error} title="Unable to load applications" />

	return (
		<div className="space-y-6">
			{/* Header */}
			<PageHeader title="Dashboard" subtitle="Overview of your job applications." />

			{applications.length === 0 ? (
				<EmptyState />
			) : (
				<>
					<div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
						{/* Main Content */}
						<div className="min-w-0">
							<Card className="shadow-lg">
								<CardHeader className="pb-3 flex items-center justify-between">
									<CardTitle className="text-lg font-semibold">Active Applications</CardTitle>
									<NewApplicationLink size="sm" />
								</CardHeader>
								<CardContent>
									<ApplicationList
										applications={applications}
										onNavigate={handleNavigate}
										onPrefetch={handlePrefetch}
										highlightedApplicationId={highlightedApplicationId}
									/>
								</CardContent>
							</Card>
						</div>

						{/* Sidebar - Always visible */}
						<div>
							<UpcomingEvents events={upcomingEvents} onHoverApplication={setHighlightedApplicationId} />
						</div>
					</div>
				</>
			)}
		</div>
	)
}
