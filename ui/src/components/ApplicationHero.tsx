import { Calendar, Clock } from 'lucide-react'
import type { ReactNode } from 'react'
import { ApplicationStatusBadge } from '@/components/ApplicationStatusBadge'
import { STATUS_ACCENT_COLORS } from '@/constants'
import { formatDate } from '@/lib/utils'
import type { Application } from '@/types'

interface ApplicationHeroProps {
	application: Application
	actions?: ReactNode
}

function formatTimeAgo(dateString: string): string {
	const date = new Date(dateString)
	const now = new Date()
	const diffMs = now.getTime() - date.getTime()
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

	if (diffDays === 0) return 'Today'
	if (diffDays === 1) return '1 day ago'
	if (diffDays < 7) return `${diffDays} days ago`
	if (diffDays < 30) {
		const weeks = Math.floor(diffDays / 7)
		return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`
	}
	const months = Math.floor(diffDays / 30)
	return months === 1 ? '1 month ago' : `${months} months ago`
}

export function ApplicationHero({ application, actions }: ApplicationHeroProps) {
	const accent = STATUS_ACCENT_COLORS[application.status]

	return (
		<div
			className={`relative rounded-xl border ${accent.border} bg-linear-to-r ${accent.gradient} overflow-hidden transition-colors duration-300`}
		>
			<div className="px-6 py-5">
				{/* Company & Actions Row */}
				<div className="flex items-start justify-between gap-4">
					<h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">{application.company}</h1>
					{actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
				</div>

				{/* Job Title & Status Row */}
				<div className="flex items-center gap-3 mt-1.5 flex-wrap">
					<p className="text-lg text-muted-foreground truncate">{application.jobTitle}</p>
					<ApplicationStatusBadge status={application.status} />
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
					<div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/60 backdrop-blur-sm border text-sm text-muted-foreground">
						<Clock className="h-3.5 w-3.5" />
						<span>
							Updated{' '}
							<span className="font-medium text-foreground">
								{formatTimeAgo(application.statusUpdatedAt)}
							</span>
						</span>
					</div>
				</div>
			</div>
		</div>
	)
}
