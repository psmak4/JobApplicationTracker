import { BarChart3, Calendar, Filter, Plus, Sparkles, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
	isFiltered?: boolean
	onResetFilters?: () => void
	variant?: 'default' | 'no-events' | 'no-archive' | 'no-results'
}

/** SVG Illustration for empty states - modern, abstract career/job search theme */
function EmptyStateIllustration({ variant = 'default' }: { variant?: EmptyStateProps['variant'] }) {
	const variants = {
		default: (
			<svg viewBox="0 0 200 160" fill="none" className="w-48 h-32" aria-hidden="true">
				<rect x="40" y="60" width="120" height="80" rx="8" className="fill-muted stroke-border" strokeWidth="2" />
				<rect x="50" y="40" width="60" height="40" rx="6" className="fill-primary/20 stroke-primary/30" strokeWidth="1.5" />
				<circle cx="80" cy="60" r="12" className="fill-primary/40" />
				<path d="M60 85 L90 100 L130 75" className="stroke-primary" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
				<circle cx="60" cy="85" r="4" className="fill-primary" />
				<circle cx="90" cy="100" r="4" className="fill-primary" />
				<circle cx="130" cy="75" r="4" className="fill-primary" />
				<rect x="120" y="50" width="30" height="25" rx="4" className="fill-card stroke-border" strokeWidth="1.5" />
				<path d="M128 60 L140 67 L148 58" className="stroke-green-500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		),
		'no-events': (
			<svg viewBox="0 0 200 160" fill="none" className="w-48 h-32" aria-hidden="true">
				<rect x="50" y="35" width="100" height="90" rx="12" className="fill-muted stroke-border" strokeWidth="2" />
				<rect x="50" y="35" width="100" height="35" rx="12" className="fill-primary/20 stroke-primary/30" strokeWidth="1.5" />
				<circle cx="100" cy="52" r="12" className="fill-primary/40" />
				<path d="M100 45 L100 52 L106 55" className="stroke-primary" strokeWidth="2.5" strokeLinecap="round" />
				<circle cx="70" cy="80" r="3" className="fill-muted-foreground/30" />
				<circle cx="130" cy="80" r="3" className="fill-muted-foreground/30" />
				<circle cx="70" cy="100" r="3" className="fill-muted-foreground/30" />
				<circle cx="130" cy="100" r="3" className="fill-muted-foreground/30" />
				<path d="M85 95 Q100 85 115 95" className="stroke-border" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" />
			</svg>
		),
		'no-archive': (
			<svg viewBox="0 0 200 160" fill="none" className="w-48 h-32" aria-hidden="true">
				<rect x="45" y="30" width="110" height="100" rx="10" className="fill-muted stroke-border" strokeWidth="2" />
				<rect x="45" y="30" width="110" height="25" rx="10" className="fill-card stroke-border" strokeWidth="1.5" />
				<path d="M85 42 L100 42 M115 42 L130 42" className="stroke-muted-foreground/30" strokeWidth="3" strokeLinecap="round" />
				<rect x="60" y="70" width="80" height="12" rx="4" className="fill-muted-foreground/10" />
				<rect x="60" y="90" width="60" height="12" rx="4" className="fill-muted-foreground/10" />
				<circle cx="160" cy="145" r="25" className="fill-green-500/20" />
				<path d="M150 145 L158 153 L172 138" className="stroke-green-500" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		),
		'no-results': (
			<svg viewBox="0 0 200 160" fill="none" className="w-48 h-32" aria-hidden="true">
				<circle cx="90" cy="75" r="35" className="fill-muted stroke-border" strokeWidth="2" />
				<circle cx="90" cy="75" r="20" className="fill-card stroke-border" strokeWidth="1.5" />
				<path d="M75 65 L85 75 L105 55" className="stroke-muted-foreground/40" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
				<rect x="140" y="50" width="20" height="20" rx="4" transform="rotate(15 140 50)" className="fill-muted stroke-border" strokeWidth="1.5" />
				<rect x="145" y="100" width="15" height="15" rx="3" transform="rotate(-10 145 100)" className="fill-muted-foreground/20 stroke-border" strokeWidth="1" />
				<path d="M55 110 Q70 95 85 110" className="stroke-border" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 3" />
			</svg>
		),
	}

	return variants[variant] || variants.default
}

export function EmptyState({ isFiltered = false, onResetFilters, variant = 'default' }: EmptyStateProps) {
	// Filtered/no results state
	if (isFiltered || variant === 'no-results') {
		return (
			<div className="flex flex-col items-center justify-center py-16 px-4 text-center">
				<div className="relative mb-6">
					<div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full animate-pulse" />
					<div className="relative">
						<EmptyStateIllustration variant="no-results" />
					</div>
				</div>
				<h3 className="text-xl font-semibold mb-2">
					{isFiltered ? 'No matching applications' : 'No results found'}
				</h3>
				<p className="text-muted-foreground mb-6 max-w-sm">
					{isFiltered
						? "We couldn't find any applications matching your current filters. Try adjusting your search criteria."
						: 'Try adjusting your search or filters to find what you are looking for.'}
				</p>
				{onResetFilters && (
					<button onClick={onResetFilters} className={cn(buttonVariants({ variant: 'outline' }), 'gap-2')}>
						<Filter className="h-4 w-4" />
						Clear all filters
					</button>
				)}
			</div>
		)
	}

	// No events state
	if (variant === 'no-events') {
		return (
			<div className="flex flex-col items-center justify-center py-12 px-4 text-center">
				<div className="relative mb-4">
					<div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full" />
					<EmptyStateIllustration variant="no-events" />
				</div>
				<h3 className="text-lg font-semibold mb-2">No upcoming events</h3>
				<p className="text-muted-foreground text-sm max-w-xs">
					Add interviews or meetings from any application to see them here.
				</p>
			</div>
		)
	}

	// No archive state
	if (variant === 'no-archive') {
		return (
			<div className="flex flex-col items-center justify-center py-12 px-4 text-center">
				<div className="relative mb-4">
					<div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full" />
					<EmptyStateIllustration variant="no-archive" />
				</div>
				<h3 className="text-lg font-semibold mb-2">No archived applications</h3>
				<p className="text-muted-foreground text-sm max-w-xs">
					Archived applications will appear here. You can archive an application from its details page.
				</p>
			</div>
		)
	}

	// Main default state with CTA
	return (
		<div className="flex flex-col items-center justify-center py-16 px-4 text-center">
			<div className="relative mb-8">
				<div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
				<div className="relative p-6 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl border border-primary/20">
					<EmptyStateIllustration variant="default" />
					<Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-amber-400 animate-bounce" />
				</div>
			</div>

			<h2 className="text-2xl font-bold mb-3">Start Your Job Search Journey</h2>
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
