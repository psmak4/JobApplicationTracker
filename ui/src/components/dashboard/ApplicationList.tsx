import { ChevronRight, Clock, MapPin } from 'lucide-react'
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
				const lastUpdate = getLastStatusDate(app)
				const stalenessColor = getStalenessColor(lastUpdate, currentStatus)

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
							<div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
								{/* Company & Role */}
								<div className="md:col-span-5 flex flex-col min-w-0">
									<div className="font-semibold text-lg truncate leading-tight group-hover:text-primary transition-colors">
										{app.company}
									</div>
									<div className="text-sm text-muted-foreground truncate">{app.jobTitle}</div>
								</div>

								{/* Status Badge */}
								<div className="md:col-span-3 flex items-center">
									<ApplicationStatusBadge currentStatus={currentStatus} />
								</div>

								{/* Meta Info (Date/Location) */}
								<div className="md:col-span-4 flex items-center gap-4 text-sm text-muted-foreground justify-end md:justify-start">
									<div className={`flex items-center gap-1.5 whitespace-nowrap ${stalenessColor}`}>
										<Clock className="h-3.5 w-3.5" />
										<span>{formatDisplayDate(lastUpdate)}</span>
									</div>
									{app.location && (
										<div className="hidden md:flex items-center gap-1.5 truncate">
											<MapPin className="h-3.5 w-3.5" />
											<span className="truncate">{app.location}</span>
										</div>
									)}
								</div>
							</div>

							{/* Chevron */}
							<div className="shrink-0 text-muted-foreground/50 group-hover:text-primary transition-colors">
								<ChevronRight className="h-5 w-5" />
							</div>
						</div>
					</div>
				)
			})}
		</div>
	)
}
