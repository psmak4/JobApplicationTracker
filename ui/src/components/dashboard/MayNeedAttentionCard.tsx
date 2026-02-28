import { AlertCircle, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getUrgencyColor } from '@/lib/action-dashboard-utils'
import type { StaleApplication } from '@/types'

interface Props {
	applications: StaleApplication[]
}

export function MayNeedAttentionCard({ applications }: Props) {
	const navigate = useNavigate()

	if (applications.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
						All Caught Up!
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">Your applications are all up to date. Great work!</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
					May Need Attention ({applications.length})
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{applications.slice(0, 3).map((app) => (
					<div
						key={app.id}
						onClick={() => navigate(`/applications/${app.id}`)}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault()
								navigate(`/applications/${app.id}`)
							}
						}}
						role="button"
						tabIndex={0}
						aria-label={`View ${app.company} - ${app.jobTitle}`}
						className="p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
					>
						<p className="font-medium text-sm">{app.company}</p>
						<p className="text-sm text-muted-foreground truncate">{app.jobTitle}</p>
						<div className="flex items-center gap-2 mt-1 text-xs">
							<span className={getUrgencyColor(app.daysSinceUpdate)}>
								No update in {app.daysSinceUpdate} days
							</span>
							<span className="text-muted-foreground">•</span>
							<span className="text-muted-foreground">{app.status}</span>
						</div>
					</div>
				))}
				{applications.length > 3 && (
					<p className="text-xs text-muted-foreground text-center pt-2">+{applications.length - 3} more</p>
				)}
			</CardContent>
		</Card>
	)
}
