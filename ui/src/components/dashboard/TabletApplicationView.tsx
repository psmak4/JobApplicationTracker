import React from 'react'
import { KANBAN_COLUMNS, type KanbanColumn } from '@/constants'
import { getKanbanColumn } from '@/lib/application-helpers'
import type { ApplicationSummary } from '@/types'
import { TabletApplicationSection } from './TabletApplicationSection'

interface TabletApplicationViewProps {
	applications: ApplicationSummary[]
}

export const TabletApplicationView = React.memo(function TabletApplicationView({
	applications,
}: TabletApplicationViewProps) {
	// Group applications by kanban column
	const groupedApplications = React.useMemo(() => {
		const groups: Record<KanbanColumn, ApplicationSummary[]> = {
			Applied: [],
			Interviewing: [],
			'Offer Received': [],
			Closed: [],
		}
		for (const app of applications) {
			const column = getKanbanColumn(app.status)
			if (column in groups) {
				groups[column as KanbanColumn].push(app)
			}
		}
		return groups
	}, [applications])

	return (
		<div className="space-y-3">
			{KANBAN_COLUMNS.map((column) => (
				<TabletApplicationSection
					key={column}
					status={column}
					applications={groupedApplications[column]}
					showStatusBadge={column === 'Closed'}
				/>
			))}
		</div>
	)
})
