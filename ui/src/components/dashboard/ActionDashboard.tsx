import { useMemo } from 'react'
import { useActiveApplications } from '@/hooks/useApplications'
import {
	getDashboardStats,
	getRecentActivity,
	getStaleApplications,
	getUpcomingEvents,
} from '@/lib/action-dashboard-utils'
import { ComingUpCard } from './ComingUpCard'
import { MayNeedAttentionCard } from './MayNeedAttentionCard'
import { RecentActivityCard } from './RecentActivityCard'
import { StatsAtAGlanceCard } from './StatsAtAGlanceCard'

export function ActionDashboard() {
	const { data: applications = [] } = useActiveApplications()

	const staleApps = useMemo(() => getStaleApplications(applications), [applications])

	const upcomingEvents = useMemo(() => getUpcomingEvents(applications), [applications])

	const recentActivity = useMemo(() => getRecentActivity(applications), [applications])

	const dashboardStats = useMemo(() => getDashboardStats(applications), [applications])

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
			<StatsAtAGlanceCard stats={dashboardStats} />
			<MayNeedAttentionCard applications={staleApps} />
			<ComingUpCard events={upcomingEvents} />
			<RecentActivityCard stats={recentActivity} />
		</div>
	)
}
