import { ApplicationStatusBadge } from '@/components/ApplicationStatusBadge'
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
		<div className="rounded-lg border bg-card divide-y">
			{applications.map((app) => {
				const isHighlighted = highlightedApplicationId === app.id

				return (
					<div
						key={app.id}
						className={cn(
							'group flex items-center overflow-hidden transition-all',
							isHighlighted
								? 'bg-muted/80 ring-2 ring-primary ring-offset-2 ring-offset-background'
								: 'hover:bg-muted/50',
						)}
						onMouseEnter={() => onPrefetch(app.id)}
					>
						{/* Clickable Area Wrapper */}
						<div
							className="flex flex-1 items-center p-4 gap-4 cursor-pointer pl-6 hover:bg-muted/50 transition-colors"
							onClick={() => onNavigate(app.id)}
						>
							{/* Main Info */}
							<div className="flex-1 min-w-0 flex items-center justify-between gap-4">
								{/* Company & Role */}
								<div className="flex flex-col gap-0.5 min-w-0">
									<div className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
										{app.company}
									</div>
									<div className="text-sm text-muted-foreground truncate">{app.jobTitle}</div>
								</div>

								{/* Status Badge */}
								<div className="flex flex-col gap-2 items-end">
									<ApplicationStatusBadge status={app.status} />
									<div className="text-xs text-muted-foreground text-nowrap flex gap-1">
										<span>{app.location}</span> • <span>{app.workType}</span>
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
