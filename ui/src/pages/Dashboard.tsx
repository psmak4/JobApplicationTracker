import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '@/components/PageHeader'
import { QueryError, QueryLoading } from '@/components/QueryState'
import { EmptyState, ResponsiveApplicationView, UpcomingEvents } from '@/components/dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useApplicationPrefetch, useApplications } from '@/hooks/useApplications'
import { useAddStatusDynamic } from '@/hooks/useMutations'
import type { ApplicationStatus } from '@/types'

export default function Dashboard() {
	const navigate = useNavigate()
	const { data: applications = [], isLoading, error } = useApplications()
	const prefetchApplication = useApplicationPrefetch()
	const addStatusMutation = useAddStatusDynamic()

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

	const handleStatusChange = useCallback(
		(applicationId: string, newStatus: ApplicationStatus) => {
			const today = new Date().toLocaleDateString('en-CA')
			addStatusMutation.mutate({ applicationId, status: newStatus, date: today })
		},
		[addStatusMutation],
	)

	if (isLoading) return <QueryLoading text="Loading applications..." />
	if (error) return <QueryError error={error} title="Unable to load applications" />

	return (
		<div className="space-y-6">
			<PageHeader title="Dashboard" subtitle="Overview of your job applications." />

			{applications.length === 0 ? (
				<EmptyState />
			) : (
				<>
					<div className="flex flex-col-reverse lg:flex-row gap-6 justify-center">
						<div className="min-w-0 flex-1">
							<Card>
								<CardHeader className="pb-3">
									<CardTitle className="text-lg font-semibold">Applications</CardTitle>
								</CardHeader>
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

						{upcomingEvents.length > 0 && (
							<div>
								<UpcomingEvents events={upcomingEvents} />
							</div>
						)}
					</div>
				</>
			)}
		</div>
	)
}
