import ApplicationStatusBadge from '@/components/ApplicationStatusBadge'
import { useDashboardFilters } from '@/hooks/useDashboardFilters'
import { cn } from '@/lib/utils'
import { formatDisplayDate } from '@/lib/utils'
import type { ApplicationSummary } from '@/types'
import { EmptyState } from './EmptyState'

interface ApplicationListProps {
	applications: ApplicationSummary[]
	onNavigate: (id: string) => void
	onPrefetch: (id: string) => void
	highlightedApplicationId?: string | null
}

export function ApplicationList({ applications, onNavigate, onPrefetch, highlightedApplicationId }: ApplicationListProps) {
	const { getCurrentStatus, getLastStatusDate, getStalenessColor, resetFilters } = useDashboardFilters()

	if (applications.length === 0) {
		return <EmptyState isFiltered onResetFilters={resetFilters} />
	}

	return (
		<div className="rounded-lg border bg-card divide-y">
			{applications.map((app) => {
				const currentStatus = getCurrentStatus(app)
				const lastStatusDate = getLastStatusDate(app)
				const stalenessColor = getStalenessColor(lastStatusDate, currentStatus)
				const isHighlighted = highlightedApplicationId === app.id

				return (
					<div
						key={app.id}
						className={cn(
							"group flex items-center overflow-hidden transition-all",
							isHighlighted ? 'bg-muted/80 ring-2 ring-primary ring-offset-2 ring-offset-background' : 'hover:bg-muted/50'
						)}
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
