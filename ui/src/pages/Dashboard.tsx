import { Calendar, Plus } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageHeader from '@/components/PageHeader'
import {
	ApplicationList,
	DashboardMobileFilters,
	DashboardToolbar,
	EmptyState,
	UpcomingEvents,
} from '@/components/dashboard'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useApplicationPrefetch, useApplications } from '@/hooks/useApplications'
import { useDashboardFilters } from '@/hooks/useDashboardFilters'
import { cn } from '@/lib/utils'

export default function Dashboard() {
	const navigate = useNavigate()
	const { data: applications = [], isLoading, error } = useApplications()
	const prefetchApplication = useApplicationPrefetch()

	// Use custom hook for filter/sort state management
	const {
		sortConfig,
		filterConfig,
		activeFilterCount,
		setSortConfig,
		setFilterConfig,
		toggleStatus,
		resetFilters,
		toggleSortDirection,
		getCurrentStatus,
		getLastStatusDate,
	} = useDashboardFilters()

	// Derived data
	const upcomingEvents = useMemo(() => {
		const now = new Date()
		const events = applications.flatMap((app) =>
			app.statusHistory
				.filter((entry) => entry.eventStartTime && entry.eventId && new Date(entry.eventStartTime) > now)
				.map((entry) => ({
					id: entry.id,
					applicationId: app.id,
					company: app.company,
					jobTitle: app.jobTitle,
					eventTitle: entry.eventTitle || 'Scheduled Event',
					eventDate: entry.eventStartTime!,
					eventUrl: entry.eventUrl,
					status: entry.status,
				})),
		)
		return events.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
	}, [applications])

	const uniqueCompanies = useMemo(() => {
		const companies = new Set(applications.map((app) => app.company))
		return Array.from(companies).sort()
	}, [applications])

	const filteredAndSortedApplications = useMemo(() => {
		let result = [...applications]

		// Filter
		if (filterConfig.company && filterConfig.company !== 'all') {
			const query = filterConfig.company.toLowerCase()
			result = result.filter((app) => app.company.toLowerCase() === query)
		}

		if (filterConfig.status.length > 0) {
			result = result.filter((app) => filterConfig.status.includes(getCurrentStatus(app)))
		}

		// Sort
		result.sort((a, b) => {
			let valA: string | number = ''
			let valB: string | number = ''

			switch (sortConfig.key) {
				case 'company':
					valA = a.company.toLowerCase()
					valB = b.company.toLowerCase()
					break
				case 'status':
					valA = getCurrentStatus(a)
					valB = getCurrentStatus(b)
					break
				case 'lastStatusUpdate':
					valA = new Date(getLastStatusDate(a)).getTime()
					valB = new Date(getLastStatusDate(b)).getTime()
					break
			}

			if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1
			if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1
			return 0
		})

		return result
	}, [applications, sortConfig, filterConfig, getCurrentStatus, getLastStatusDate])

	// Navigation handlers
	const handleNavigate = useCallback(
		(id: string) => {
			navigate(`/applications/${id}`)
		},
		[navigate],
	)

	const handlePrefetch = useCallback(
		(id: string) => {
			prefetchApplication(id)
		},
		[prefetchApplication],
	)

	// Loading and error states
	if (isLoading) return <div className="p-8 text-center">Loading applications...</div>
	if (error) return <div className="p-8 text-center text-destructive">Error loading applications</div>

	return (
		<div className="space-y-6">
			{/* Header */}
			<PageHeader title="Dashboard" subtitle="Overview of your job applications." />

			{applications.length === 0 ? (
				<EmptyState />
			) : (
				<div className="flex flex-col-reverse lg:flex-row gap-6 justify-center">
					{/* Main Content */}
					<div className="space-y-6 min-w-0 flex-1">
						<Card className="bg-card/50 backdrop-blur-sm">
							<CardHeader className="pb-3 flex items-center justify-between">
								<CardTitle className="text-lg font-semibold flex items-center gap-2">
									<Calendar className="h-5 w-5 text-primary" />
									Job Applications
								</CardTitle>
								<Link
									to="/new"
									className={cn(
										buttonVariants({ variant: 'default', size: 'sm' }),
										'flex items-center gap-2',
									)}
									aria-label="Create new application"
								>
									<Plus className="h-4 w-4" /> New Application
								</Link>
							</CardHeader>
							<CardContent className="space-y-6">
								{/* Desktop Toolbar */}
								<DashboardToolbar
									filterConfig={filterConfig}
									sortConfig={sortConfig}
									activeFilterCount={activeFilterCount}
									uniqueCompanies={uniqueCompanies}
									onFilterChange={setFilterConfig}
									onSortChange={setSortConfig}
									onToggleStatus={toggleStatus}
									onResetFilters={resetFilters}
									onToggleSortDirection={toggleSortDirection}
								/>

								{/* Mobile Toolbar */}
								<DashboardMobileFilters
									filterConfig={filterConfig}
									sortConfig={sortConfig}
									activeFilterCount={activeFilterCount}
									uniqueCompanies={uniqueCompanies}
									filteredCount={filteredAndSortedApplications.length}
									onFilterChange={setFilterConfig}
									onSortChange={setSortConfig}
									onToggleStatus={toggleStatus}
									onResetFilters={resetFilters}
								/>

								<ApplicationList
									applications={filteredAndSortedApplications}
									onNavigate={handleNavigate}
									onPrefetch={handlePrefetch}
								/>
							</CardContent>
						</Card>
					</div>

					{/* Sidebar */}
					{upcomingEvents.length > 0 && (
						<div>
							<UpcomingEvents events={upcomingEvents} />
						</div>
					)}
				</div>
			)}
		</div>
	)
}
