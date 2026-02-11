import { ArrowLeft, Calendar, Clock } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ApplicationStatusBadge } from '@/components/ApplicationStatusBadge'
import { STATUS_ACCENT_COLORS } from '@/constants'
import type { Application } from '@/types'
import { Button } from './ui/button'

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
				{/* Top row: Back + Actions */}
				<div className="flex items-center justify-between mb-4">
					<Button
						render={
							<Link to="/pipeline">
								<ArrowLeft className="h-4 w-4 mr-2" />
								Pipeline
							</Link>
						}
						variant="ghost"
						size="sm"
						nativeButton={false}
						aria-label="Back to pipeline"
					/>
					{actions && <div className="flex items-center gap-2">{actions}</div>}
				</div>

				{/* Main content */}
				<div className="flex flex-col sm:flex-row sm:items-start gap-4">
					{/* Company & Title */}
					<div className="flex-1 min-w-0">
						<h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">
							{application.company}
						</h1>
						<p className="text-lg text-muted-foreground mt-0.5 truncate">{application.jobTitle}</p>
					</div>

					{/* Status Badge — larger */}
					<div className="shrink-0">
						<ApplicationStatusBadge status={application.status} />
					</div>
				</div>

				{/* Stat pills */}
				<div className="flex flex-wrap gap-3 mt-4">
					<div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/60 backdrop-blur-sm border text-sm text-muted-foreground">
						<Calendar className="h-3.5 w-3.5" />
						<span>
							Applied{' '}
							<span className="font-medium text-foreground">{formatTimeAgo(application.appliedAt)}</span>
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
