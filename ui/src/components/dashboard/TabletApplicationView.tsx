import { useMemo } from 'react'
import { APPLICATION_STATUS_OPTIONS } from '@/constants'
import { getCurrentStatus } from '@/lib/application-helpers'
import type { ApplicationStatus, ApplicationSummary } from '@/types'
import { TabletApplicationSection } from './TabletApplicationSection'

interface TabletApplicationViewProps {
	applications: ApplicationSummary[]
	onNavigate: (id: string) => void
	onPrefetch: (id: string) => void
	onStatusChange: (applicationId: string, newStatus: ApplicationStatus) => void
}

export function TabletApplicationView({
	applications,
	onNavigate,
	onPrefetch,
	onStatusChange,
}: TabletApplicationViewProps) {
	// Group applications by status
	const applicationsByStatus = useMemo(() => {
		const grouped: Record<ApplicationStatus, ApplicationSummary[]> = {
			Applied: [],
			Interviewing: [],
			'Offer Received': [],
			Rejected: [],
			Withdrawn: [],
		}

		for (const app of applications) {
			const status = getCurrentStatus(app)
			if (status in grouped) {
				grouped[status as ApplicationStatus].push(app)
			}
		}

		return grouped
	}, [applications])

	return (
		<div className="space-y-3">
			{APPLICATION_STATUS_OPTIONS.map((status) => (
				<TabletApplicationSection
					key={status}
					status={status}
					applications={applicationsByStatus[status]}
					onNavigate={onNavigate}
					onPrefetch={onPrefetch}
					onStatusChange={onStatusChange}
				/>
			))}
		</div>
	)
}
