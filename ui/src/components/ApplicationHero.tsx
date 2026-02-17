import { Calendar } from 'lucide-react'
import type { ReactNode } from 'react'
import { STATUS_THEME } from '@/constants'
import { formatDate } from '@/lib/utils'
import type { Application } from '@/types'

interface ApplicationHeroProps {
	application: Application
	actions?: ReactNode
}

export function ApplicationHero({ application, actions }: ApplicationHeroProps) {
	const accent = STATUS_THEME[application.status].hero
	const solidBg = STATUS_THEME[application.status].solid

	return (
		<div
			className={`flex relative rounded-xl border ${accent.border} bg-linear-to-r ${accent.gradient} overflow-hidden transition-colors duration-300`}
		>
			{/* Vertical Status Bar */}
			<div className={`w-10 shrink-0 flex items-center justify-center ${solidBg}`}>
				<span className="text-white text-xs font-bold tracking-wider uppercase whitespace-nowrap -rotate-90 select-none">
					{application.status}
				</span>
			</div>

			<div className="flex-1 min-w-0 px-6 py-5">
				{/* Company & Actions Row */}
				<div className="flex items-start justify-between gap-4">
					<h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">{application.company}</h1>
					{actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
				</div>

				{/* Job Title Row */}
				<div className="flex items-center gap-3 mt-1.5 flex-wrap">
					<p className="text-lg text-muted-foreground truncate">{application.jobTitle}</p>
				</div>

				{/* Stat pills */}
				<div className="flex flex-wrap gap-3 mt-4">
					<div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/60 backdrop-blur-sm border text-sm text-muted-foreground">
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
