import { Plus } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApplicationGrid, ApplicationTable, DashboardMobileFilters, DashboardToolbar } from '@/components/dashboard'
import { useDashboardFilters } from '@/hooks/useDashboardFilters'
import { buttonVariants } from '../components/ui/button'
import { useApplicationPrefetch, useApplications } from '../hooks/useApplications'
import { cn } from '../lib/utils'

export default function Dashboard() {
	const navigate = useNavigate()
	const { data: applications = [], isLoading, error } = useApplications()
	const prefetchApplication = useApplicationPrefetch()

	// Use custom hook for filter/sort state management
	const {
		sortConfig,
		filterConfig,
		viewMode,
		activeFilterCount,
		setSortConfig,
		setFilterConfig,
		setViewMode,
		toggleStatus,
		resetFilters,
		toggleSortDirection,
		getCurrentStatus,
		getLastStatusDate,
		getStalenessColor,
	} = useDashboardFilters()

	// Derived data
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
			<div className="flex gap-4 justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
					<p className="hidden sm:block text-muted-foreground">Overview of your job applications.</p>
				</div>

				<Link
					to="/new"
					className={cn(
						buttonVariants({ variant: 'default', size: 'lg' }),
						'hidden sm:flex items-center gap-2',
					)}
				>
					<Plus className="h-4 w-4" /> New Application
				</Link>
				<Link
					to="/new"
					className={cn(buttonVariants({ variant: 'default', size: 'icon-lg' }), 'sm:hidden')}
					aria-label="Create new application"
				>
					<Plus className="h-4 w-4" />
				</Link>
			</div>

			{/* Desktop Toolbar */}
			<DashboardToolbar
				filterConfig={filterConfig}
				sortConfig={sortConfig}
				viewMode={viewMode}
				activeFilterCount={activeFilterCount}
				uniqueCompanies={uniqueCompanies}
				onFilterChange={setFilterConfig}
				onSortChange={setSortConfig}
				onViewModeChange={setViewMode}
				onToggleStatus={toggleStatus}
				onResetFilters={resetFilters}
				onToggleSortDirection={toggleSortDirection}
			/>

			{/* Mobile Toolbar */}
			<DashboardMobileFilters
				filterConfig={filterConfig}
				sortConfig={sortConfig}
				viewMode={viewMode}
				activeFilterCount={activeFilterCount}
				uniqueCompanies={uniqueCompanies}
				filteredCount={filteredAndSortedApplications.length}
				onFilterChange={setFilterConfig}
				onSortChange={setSortConfig}
				onViewModeChange={setViewMode}
				onToggleStatus={toggleStatus}
				onResetFilters={resetFilters}
			/>

			{/* Results Count */}
			<div className="text-sm text-muted-foreground">
				{filteredAndSortedApplications.length} application
				{filteredAndSortedApplications.length !== 1 ? 's' : ''}
				{activeFilterCount > 0 && ` (filtered from ${applications.length})`}
			</div>

			{/* Table or Card View */}
			{viewMode === 'table' ? (
				<ApplicationTable
					applications={filteredAndSortedApplications}
					getCurrentStatus={getCurrentStatus}
					getLastStatusDate={getLastStatusDate}
					getStalenessColor={getStalenessColor}
					onNavigate={handleNavigate}
					onPrefetch={handlePrefetch}
				/>
			) : (
				<ApplicationGrid
					applications={filteredAndSortedApplications}
					getCurrentStatus={getCurrentStatus}
					getLastStatusDate={getLastStatusDate}
					getStalenessColor={getStalenessColor}
					onNavigate={handleNavigate}
					onPrefetch={handlePrefetch}
				/>
			)}
		</div>
	)
}
