import { ApplicationStatusBadge } from '@/components/ApplicationStatusBadge'
import { getStatusBarClasses } from '@/constants'
import { cn } from '@/lib/utils'
import type { ApplicationSummary } from '@/types'
import { EmptyState } from './EmptyState'

interface ApplicationListProps {
	applications: ApplicationSummary[]
	onNavigate: (id: string) => void
	onPrefetch: (id: string) => void
	highlightedApplicationId?: string | null
}

export function ApplicationList({
	applications,
	onNavigate,
	onPrefetch,
	highlightedApplicationId,
}: ApplicationListProps) {
	if (applications.length === 0) {
		return <EmptyState />
	}

	return (
		<div className="card-elevated divide-y overflow-hidden">
			{applications.map((app) => {
				const isHighlighted = highlightedApplicationId === app.id

				return (
					<div
						key={app.id}
						className={cn(
							'relative group flex items-stretch overflow-hidden transition-all',
							isHighlighted
								? 'bg-muted/80 ring-2 ring-primary ring-offset-2 ring-offset-background'
								: 'card-interactive border-0 shadow-none rounded-none hover:translate-y-0',
						)}
						onMouseEnter={() => onPrefetch(app.id)}
						onClick={() => onNavigate(app.id)}
					>
						{/* Status Bar */}
						<div className={cn('status-bar', getStatusBarClasses(app.status))} />

						{/* Main Info */}
						<div className="flex flex-1 items-center p-4 pl-6 gap-4">
							<div className="flex-1 min-w-0 flex items-center justify-between gap-4">
								<div className="flex flex-col gap-0.5 min-w-0">
									<div className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
										{app.company}
									</div>
									<div className="text-sm truncate">{app.jobTitle}</div>
									<div className="text-sm text-muted-foreground text-nowrap flex gap-1">
										<span>{app.location}</span> • <span>{app.workType}</span>
									</div>
								</div>

								<ApplicationStatusBadge status={app.status} />
							</div>
						</div>
					</div>
				)
			})}
		</div>
	)
}
