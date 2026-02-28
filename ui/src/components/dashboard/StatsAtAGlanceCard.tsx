import { BarChart3, Briefcase, Clock, Target, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DashboardStats } from '@/types'

interface Props {
	stats: DashboardStats
}

export function StatsAtAGlanceCard({ stats }: Props) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<BarChart3 className="h-5 w-5" />
					Your Job Search
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				<StatRow
					icon={<Briefcase className="h-4 w-4 text-blue-500" />}
					label="Active"
					value={`${stats.active} application${stats.active !== 1 ? 's' : ''}`}
				/>
				<StatRow
					icon={<TrendingUp className="h-4 w-4 text-green-500" />}
					label="This Week"
					value={`${stats.thisWeekNew} new, ${stats.thisWeekInterviews} interview${stats.thisWeekInterviews !== 1 ? 's' : ''}`}
				/>
				<StatRow
					icon={<Clock className="h-4 w-4 text-amber-500" />}
					label="Avg Response"
					value={stats.avgResponseDays !== null ? `${stats.avgResponseDays} days` : 'N/A'}
				/>
				<StatRow
					icon={<Target className="h-4 w-4 text-purple-500" />}
					label="Hit Rate"
					value={`${stats.hitRatePercentage}% (${stats.hitRateNumerator}/${stats.hitRateDenominator} to interview)`}
				/>
			</CardContent>
		</Card>
	)
}

function StatRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
	return (
		<div className="flex items-center gap-3">
			{icon}
			<div className="flex items-baseline gap-2 min-w-0">
				<span className="text-sm font-medium whitespace-nowrap">{label}:</span>
				<span className="text-sm text-muted-foreground truncate">{value}</span>
			</div>
		</div>
	)
}
