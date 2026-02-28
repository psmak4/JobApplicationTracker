import { TrendingUp } from 'lucide-react'
import NewApplicationLink from '@/components/NewApplicationLink'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { RecentActivityStats } from '@/types'

interface Props {
	stats: RecentActivityStats
}

export function RecentActivityCard({ stats }: Props) {
	const hasActivity = stats.applied > 0 || stats.interviews > 0 || stats.offers > 0

	if (!hasActivity) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<TrendingUp className="h-5 w-5" />
						Last 7 Days
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<p className="text-sm text-muted-foreground">
						No activity yet this week. Ready to apply to some positions?
					</p>
					<NewApplicationLink size="sm" />
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<TrendingUp className="h-5 w-5" />
					Last 7 Days
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-3 gap-4">
					<StatItem value={stats.applied} label="Applied" />
					<StatItem value={stats.interviews} label="Interviews" />
					<StatItem value={stats.offers} label="Offers" />
				</div>
			</CardContent>
		</Card>
	)
}

function StatItem({ value, label }: { value: number; label: string }) {
	return (
		<div className="text-center">
			<p className="text-3xl font-bold">{value}</p>
			<p className="text-xs text-muted-foreground mt-1">{label}</p>
		</div>
	)
}
