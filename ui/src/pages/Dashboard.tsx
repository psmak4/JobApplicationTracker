import { Plus } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageHeader from '@/components/PageHeader'
import { QueryError, QueryLoading } from '@/components/QueryState'
import { ApplicationList, EmptyState, UpcomingEvents } from '@/components/dashboard'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useActiveApplications, useApplicationPrefetch } from '@/hooks/useApplications'
import { cn } from '@/lib/utils'

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
					<div className="flex flex-col-reverse lg:flex-row gap-6 justify-center">
						{/* Main Content */}
						<div className="min-w-0 flex-1">
							<Card>
								<CardHeader className="pb-3 flex items-center justify-between">
									<CardTitle className="text-lg font-semibold">Active Applications</CardTitle>
									<Link
										to="/new"
										className={cn(
											buttonVariants({ variant: 'default' }),
											'flex items-center gap-2',
										)}
										aria-label="Create new application"
									>
										<Plus className="h-4 w-4" /> New Application
									</Link>
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

						{/* Sidebar */}
						{upcomingEvents.length > 0 && (
							<div>
								<UpcomingEvents
									events={upcomingEvents}
									onHoverApplication={setHighlightedApplicationId}
								/>
							</div>
						)}
					</div>
				</>
			)}
		</div>
	)
}
