import { BarChart3, Briefcase, Calendar, Plus, Sparkles, Target, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
	isFiltered?: boolean
	onResetFilters?: () => void
}
export function EmptyState({ isFiltered = false, onResetFilters }: EmptyStateProps) {
	if (isFiltered) {
		return (
			<div className="flex flex-col items-center justify-center py-16 px-4 text-center">
				<div className="relative mb-6">
					<div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
					<div className="relative p-4 bg-muted rounded-2xl">
						<Target className="h-12 w-12 text-muted-foreground" />
					</div>
				</div>
				<h3 className="text-xl font-semibold mb-2">No matching applications</h3>
				<p className="text-muted-foreground mb-6 max-w-sm">
					We couldn't find any applications matching your current filters. Try adjusting your search criteria.
				</p>
				{onResetFilters && (
					<button onClick={onResetFilters} className={cn(buttonVariants({ variant: 'outline' }), 'gap-2')}>
						Clear all filters
					</button>
				)}
			</div>
		)
	}

	return (
		<div className="flex flex-col items-center justify-center py-16 px-4 text-center">
			<div className="mb-8">
				<div className="relative p-6 bg-linear-to-br from-primary/20 to-primary/5 rounded-3xl border border-primary/20">
					<Briefcase className="h-16 w-16 text-primary" />
					<Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-amber-400 animate-bounce" />
				</div>
			</div>

			<h2 className="text-2xl font-bold mb-3 bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">
				Start Your Job Search Journey
			</h2>
			<p className="text-muted-foreground mb-8 max-w-md leading-relaxed">
				Track your applications, monitor interview progress, and stay organized throughout your job search. Add
				your first application to get started!
			</p>

			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-2xl w-full">
				<FeatureCard
					icon={BarChart3}
					title="Track Progress"
					description="Monitor every stage of your applications"
				/>
				<FeatureCard
					icon={Calendar}
					title="Stay Organized"
					description="View upcoming interviews and deadlines"
				/>
				<FeatureCard
					icon={TrendingUp}
					title="Gain Insights"
					description="Understand your job search patterns"
				/>
			</div>

			<Link to="/new" className={cn(buttonVariants({ variant: 'default', size: 'lg' }), 'gap-2 text-base px-8')}>
				<Plus className="h-5 w-5" />
				Add Your First Application
			</Link>
		</div>
	)
}

function FeatureCard({
	icon: Icon,
	title,
	description,
}: {
	icon: React.ElementType
	title: string
	description: string
}) {
	return (
		<div className="group flex items-start gap-4 rounded-xl border border-transparent p-4 text-left transition-all hover:bg-muted/50 hover:border-border/50">
			<div className="shrink-0 rounded-lg bg-primary/10 p-2.5 text-primary transition-colors group-hover:bg-primary/20">
				<Icon className="h-5 w-5" />
			</div>
			<div className="space-y-1">
				<h4 className="font-medium leading-none tracking-tight">{title}</h4>
				<p className="text-sm text-muted-foreground leading-snug">{description}</p>
			</div>
		</div>
	)
}
