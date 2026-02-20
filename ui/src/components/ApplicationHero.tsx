import { Calendar } from 'lucide-react'
import type { ReactNode } from 'react'
import { ApplicationStatusBadge } from '@/components/ApplicationStatusBadge'
import { STATUS_THEME } from '@/constants'
import { formatDate } from '@/lib/utils'
import type { Application } from '@/types'

interface ApplicationHeroProps {
	application: Application
	actions?: ReactNode
}

export function ApplicationHero({ application, actions }: ApplicationHeroProps) {
	const theme = STATUS_THEME[application.status]

	return (
		<div
			className={`hero-card relative overflow-hidden transition-all duration-300 shadow-xl ${theme.hero.border} ${theme.hero.ring}`}
		>
			{/* Gradient Overlay */}
			<div className={`absolute inset-0 bg-linear-to-br ${theme.hero.gradient} opacity-50 pointer-events-none`} />

			<div className="relative flex-1 min-w-0">
				{/* Company & Actions Row */}
				<div className="flex items-start justify-between gap-4">
					<div className="flex flex-col gap-2">
						<h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">
							{application.company}
						</h1>
						<div className="flex items-center gap-3 flex-wrap">
							<ApplicationStatusBadge status={application.status} />
							<p className="text-lg text-muted-foreground truncate">{application.jobTitle}</p>
						</div>
					</div>
					{actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
				</div>

				{/* Stat pills */}
				<div className="flex flex-wrap gap-3 mt-6">
					<div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/60 backdrop-blur-sm border text-sm text-muted-foreground shadow-sm">
						<Calendar className="h-3.5 w-3.5" />
						<span className="flex items-center gap-1">
							Applied
							<span className="font-medium text-foreground">
								{formatDate(application.appliedAt, 'long')}
							</span>
						</span>
					</div>
				</div>
			</div>
		</div>
	)
}
