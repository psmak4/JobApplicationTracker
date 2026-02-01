import React from 'react'
import ApplicationStatusBadge from '@/components/ApplicationStatusBadge'
import { useDashboardFilters } from '@/hooks/useDashboardFilters'
import { formatDisplayDate } from '@/lib/utils'
import type { Application, ApplicationStatus } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

interface ApplicationCardProps {
	app: Application
	currentStatus: ApplicationStatus | 'Unknown'
	lastStatusDate: string
	stalenessColor: string
	onClick: () => void
	onMouseEnter: () => void
}

/**
 * Memoized card component to prevent unnecessary re-renders
 */
export const ApplicationCard = React.memo(
	({ app, currentStatus, lastStatusDate, stalenessColor, onClick, onMouseEnter }: ApplicationCardProps) => (
		<Card
			className="cursor-pointer hover:border-primary/50 transition-colors border ring-0 rounded-md"
			onClick={onClick}
			onMouseEnter={onMouseEnter}
		>
			<CardHeader className="pb-2">
				<div className="flex justify-between items-start gap-2">
					<CardTitle className="text-lg truncate">{app.company}</CardTitle>
					<ApplicationStatusBadge currentStatus={currentStatus} />
				</div>
				<p className="text-sm text-muted-foreground truncate">{app.jobTitle}</p>
			</CardHeader>
			<CardContent>
				<div className="text-xs text-muted-foreground flex items-center gap-2">
					<span>Last Update:</span>
					<span className={stalenessColor}>{formatDisplayDate(lastStatusDate)}</span>
				</div>
			</CardContent>
		</Card>
	),
)
ApplicationCard.displayName = 'ApplicationCard'

interface ApplicationGridProps {
	applications: Application[]
	onNavigate: (id: string) => void
	onPrefetch: (id: string) => void
}

/**
 * Card grid view for applications list in the Dashboard
 */
export function ApplicationGrid({ applications, onNavigate, onPrefetch }: ApplicationGridProps) {
	const { getCurrentStatus, getLastStatusDate, getStalenessColor } = useDashboardFilters()

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{applications.length === 0 ? (
				<p className="col-span-full text-center py-12 text-muted-foreground border rounded-lg bg-muted/10">
					No applications found matching your criteria.
				</p>
			) : (
				applications.map((app) => {
					const currentStatus = getCurrentStatus(app)
					const lastStatusDate = getLastStatusDate(app)
					return (
						<ApplicationCard
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
		</div>
	)
}
