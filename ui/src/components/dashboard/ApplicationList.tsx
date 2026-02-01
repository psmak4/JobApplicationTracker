import { useDashboardFilters } from '@/hooks/useDashboardFilters'
import { formatDisplayDate } from '@/lib/utils'
import type { Application } from '@/types'
import ApplicationStatusBadge from '../ApplicationStatusBadge'

interface ApplicationListProps {
	applications: Application[]
	onNavigate: (id: string) => void
	onPrefetch: (id: string) => void
}

export function ApplicationList({ applications, onNavigate, onPrefetch }: ApplicationListProps) {
	const { getCurrentStatus, getLastStatusDate, getStalenessColor } = useDashboardFilters()

	if (applications.length === 0) {
		return (
			<div className="text-center py-12 text-muted-foreground border rounded-lg bg-card border-dashed">
				No applications found matching your criteria.
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-3">
			{applications.map((app) => {
				const currentStatus = getCurrentStatus(app)
				const lastStatusDate = getLastStatusDate(app)
				const stalenessColor = getStalenessColor(lastStatusDate, currentStatus)

				// Determine status color strip
				let statusColorClass = 'bg-slate-400'
				if (currentStatus === 'Applied') statusColorClass = 'bg-blue-500'
				else if (currentStatus === 'Phone Screen') statusColorClass = 'bg-purple-500'
				else if (currentStatus === 'Technical Interview') statusColorClass = 'bg-orange-500'
				else if (currentStatus === 'On-site Interview') statusColorClass = 'bg-yellow-500'
				else if (currentStatus === 'Offer') statusColorClass = 'bg-green-500'
				else if (currentStatus === 'Rejected') statusColorClass = 'bg-red-500'
				else if (currentStatus === 'Withdrawn') statusColorClass = 'bg-gray-500'

				return (
					<div
						key={app.id}
						className="group relative flex items-center overflow-hidden rounded-lg border bg-card transition-all hover:bg-accent/50 hover:shadow-sm"
						onMouseEnter={() => onPrefetch(app.id)}
					>
						{/* Clickable Area Wrapper */}
						<div
							className="flex flex-1 items-center p-4 gap-4 cursor-pointer pl-6"
							onClick={() => onNavigate(app.id)}
						>
							{/* Main Info */}
							<div className="flex-1 min-w-0 flex gap-4 items-start justify-between">
								{/* Company & Role */}
								<div className="flex flex-col gap-1 min-w-0">
									<div className="text-lg leading-tight group-hover:text-primary transition-colors">
										{app.company}
									</div>
									<div className="text-sm">{app.jobTitle}</div>
								</div>

								{/* Status Badge */}
								<div className="flex flex-col gap-1 items-end">
									<ApplicationStatusBadge currentStatus={currentStatus} />
									<div className="text-sm text-muted-foreground text-nowrap flex items-center gap-1">
										<span>Most Recent Status:</span>
										<span className={stalenessColor}>{formatDisplayDate(lastStatusDate)}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				)
			})}
		</div>
	)
}
