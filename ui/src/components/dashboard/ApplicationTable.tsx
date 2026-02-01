import React from 'react'
import ApplicationStatusBadge from '@/components/ApplicationStatusBadge'
import { useDashboardFilters } from '@/hooks/useDashboardFilters'
import { formatDisplayDate } from '@/lib/utils'
import type { Application, ApplicationStatus } from '@/types'

interface ApplicationRowProps {
	app: Application
	currentStatus: ApplicationStatus | 'Unknown'
	lastStatusDate: string
	stalenessColor: string
	onClick: () => void
	onMouseEnter: () => void
}

/**
 * Memoized table row component to prevent unnecessary re-renders
 */
export const ApplicationRow = React.memo(
	({ app, currentStatus, lastStatusDate, stalenessColor, onClick, onMouseEnter }: ApplicationRowProps) => (
		<tr
			className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted cursor-pointer"
			onClick={onClick}
			onMouseEnter={onMouseEnter}
		>
			<td className="p-4 align-middle font-medium">{app.company}</td>
			<td className="p-4 align-middle">{app.jobTitle}</td>
			<td className="p-4 align-middle">
				<ApplicationStatusBadge currentStatus={currentStatus} />
			</td>
			<td className={`p-4 align-middle ${stalenessColor}`}>{formatDisplayDate(lastStatusDate)}</td>
		</tr>
	),
)
ApplicationRow.displayName = 'ApplicationRow'

interface ApplicationTableProps {
	applications: Application[]
	onNavigate: (id: string) => void
	onPrefetch: (id: string) => void
}

/**
 * Table view for applications list in the Dashboard
 */
export function ApplicationTable({ applications, onNavigate, onPrefetch }: ApplicationTableProps) {
	const { getCurrentStatus, getLastStatusDate, getStalenessColor } = useDashboardFilters()

	return (
		<div className="rounded-md border">
			<div className="relative w-full overflow-auto">
				<table className="w-full caption-bottom text-sm">
					<thead className="[&_tr]:border-b">
						<tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
							<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
								Company
							</th>
							<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
								Job Title
							</th>
							<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
								Status
							</th>
							<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
								Last Status Update
							</th>
						</tr>
					</thead>
					<tbody className="[&_tr:last-child]:border-0">
						{applications.length === 0 ? (
							<tr>
								<td colSpan={4} className="h-24 text-center">
									No applications found matching your criteria.
								</td>
							</tr>
						) : (
							applications.map((app) => {
								const currentStatus = getCurrentStatus(app)
								const lastStatusDate = getLastStatusDate(app)
								return (
									<ApplicationRow
										key={app.id}
										app={app}
										currentStatus={currentStatus}
										lastStatusDate={lastStatusDate}
										stalenessColor={getStalenessColor(lastStatusDate, currentStatus)}
										onClick={() => onNavigate(app.id)}
										onMouseEnter={() => onPrefetch(app.id)}
									/>
								)
							})
						)}
					</tbody>
				</table>
			</div>
		</div>
	)
}
