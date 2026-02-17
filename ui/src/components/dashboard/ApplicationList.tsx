import { STATUS_THEME } from '@/constants'
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
		<div className="rounded-lg border bg-card divide-y overflow-hidden">
			{applications.map((app) => {
				const isHighlighted = highlightedApplicationId === app.id

				return (
					<div
						key={app.id}
						className={cn(
							'group flex items-stretch overflow-hidden transition-all min-h-20',
							isHighlighted
								? 'bg-muted/80 ring-2 ring-primary ring-offset-2 ring-offset-background'
								: 'hover:bg-muted/50',
						)}
						onMouseEnter={() => onPrefetch(app.id)}
					>
						{/* Vertical Status Bar */}
						<div
							className={cn(
								'w-8 shrink-0 flex items-center justify-center',
								STATUS_THEME[app.status].solid,
							)}
						>
							<span className="text-white text-[10px] font-bold tracking-wider uppercase whitespace-nowrap -rotate-90 select-none">
								{app.status}
							</span>
						</div>

						{/* Clickable Area Wrapper */}
						<div
							className="flex flex-1 items-center p-4 gap-4 cursor-pointer hover:bg-muted/50 transition-colors"
							onClick={() => onNavigate(app.id)}
						>
							{/* Main Info */}
							<div className="flex-1 min-w-0 flex items-center justify-between gap-4">
								{/* Company & Role */}
								<div className="flex flex-col gap-0.5 min-w-0">
									<div className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
										{app.company}
									</div>
									<div className="text-sm truncate">{app.jobTitle}</div>
									<div className="text-sm text-muted-foreground text-nowrap flex gap-1">
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
