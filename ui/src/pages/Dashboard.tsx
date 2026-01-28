import { ArrowUpDown, Cog, Filter as FilterIcon, LayoutGrid, Plus, Table as TableIcon, X } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import ApplicationStatusBadge from '@/components/ApplicationStatusBadge'
import { APPLICATION_STATUS_OPTIONS } from '@/constants'
import { Button, buttonVariants } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Checkbox } from '../components/ui/checkbox'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { useApplicationPrefetch, useApplications } from '../hooks/useApplications'
import { cn, formatDisplayDate, safeLocalStorage } from '../lib/utils'
import type { Application, ApplicationStatus } from '../types'

type SortKey = 'company' | 'status' | 'lastStatusUpdate'
type SortDirection = 'asc' | 'desc'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
	{ value: 'lastStatusUpdate', label: 'Last Status Update' },
	{ value: 'company', label: 'Company' },
	{ value: 'status', label: 'Status' },
]

const DIRECTION_OPTIONS: { value: SortDirection; label: string }[] = [
	{ value: 'asc', label: 'Ascending' },
	{ value: 'desc', label: 'Descending' },
]

interface SortConfig {
	key: SortKey
	direction: SortDirection
}

interface FilterConfig {
	company: string
	status: string[]
}

// Memoized table row component to prevent unnecessary re-renders
const ApplicationRow = React.memo(
	({
		app,
		currentStatus,
		lastStatusDate,
		stalenessColor,
		onClick,
		onMouseEnter,
	}: {
		app: Application
		currentStatus: ApplicationStatus | 'Unknown'
		lastStatusDate: string
		stalenessColor: string
		onClick: () => void
		onMouseEnter: () => void
	}) => (
		<tr
			className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted cursor-pointer"
			onClick={onClick}
			onMouseEnter={onMouseEnter}
		>
			<td className="p-4 align-middle font-medium">{app.company}</td>
			<td className="p-4 align-middle">{app.jobTitle}</td>
			<td className="p-4 align-middle">
				<ApplicationStatusBadge currentStatus={currentStatus} />
			</td>
			<td className={`p-4 align-middle ${stalenessColor}`}>{formatDisplayDate(lastStatusDate)}</td>
		</tr>
	),
)
ApplicationRow.displayName = 'ApplicationRow'

// Memoized card component to prevent unnecessary re-renders
const ApplicationCard = React.memo(
	({
		app,
		currentStatus,
		lastStatusDate,
		stalenessColor,
		onClick,
		onMouseEnter,
	}: {
		app: Application
		currentStatus: ApplicationStatus | 'Unknown'
		lastStatusDate: string
		stalenessColor: string
		onClick: () => void
		onMouseEnter: () => void
	}) => (
		<Card
			className="cursor-pointer hover:border-primary/50 transition-colors border ring-0 rounded-md"
			onClick={onClick}
			onMouseEnter={onMouseEnter}
		>
			<CardHeader className="pb-2">
				<div className="flex justify-between items-start gap-2">
					<CardTitle className="text-lg truncate">{app.company}</CardTitle>
					<ApplicationStatusBadge currentStatus={currentStatus} />
				</div>
				<p className="text-sm text-muted-foreground truncate">{app.jobTitle}</p>
			</CardHeader>
			<CardContent>
				<div className="text-xs text-muted-foreground flex items-center gap-2">
					<span>Last Update:</span>
					<span className={stalenessColor}>{formatDisplayDate(lastStatusDate)}</span>
				</div>
			</CardContent>
		</Card>
	),
)
ApplicationCard.displayName = 'ApplicationCard'

export default function Dashboard() {
	const navigate = useNavigate()
	const [searchParams, setSearchParams] = useSearchParams()
	const { data: applications = [], isLoading, error } = useApplications()
	const prefetchApplication = useApplicationPrefetch()

	// Initialize view mode from localStorage
	const [viewMode, setViewMode] = useState<'table' | 'card'>(() => {
		const saved = safeLocalStorage.getItem('dashboard_view_mode')
		return saved === 'card' ? 'card' : 'table'
	})

	// Initialize sort config from localStorage
	const [sortConfig, setSortConfig] = useState<SortConfig>(() => {
		return safeLocalStorage.getJSON<SortConfig>('dashboard_sort_config', {
			key: 'lastStatusUpdate',
			direction: 'desc',
		})
	})

	// Initialize filter config from URL params first, then fallback to localStorage
	const [filterConfig, setFilterConfig] = useState<FilterConfig>(() => {
		const urlCompany = searchParams.get('company')
		const urlStatus = searchParams.getAll('status')

		// If URL has params, use those
		if (urlCompany || urlStatus.length > 0) {
			return {
				company: urlCompany || '',
				status: urlStatus,
			}
		}

		// Otherwise, use localStorage defaults
		return safeLocalStorage.getJSON<FilterConfig>('dashboard_filter_config', {
			company: '',
			status: [],
		})
	})

	const [isFiltersOpen, setIsFiltersOpen] = useState(() => {
		const saved = safeLocalStorage.getItem('dashboard_controls_open')
		return saved ? saved === 'true' : false
	})

	// Sync filter config to URL params
	useEffect(() => {
		const params = new URLSearchParams()

		if (filterConfig.company && filterConfig.company !== 'all') {
			params.set('company', filterConfig.company)
		}

		filterConfig.status.forEach((status) => {
			params.append('status', status)
		})

		// Only update URL if params changed
		const newSearch = params.toString()
		const currentSearch = searchParams.toString()
		if (newSearch !== currentSearch) {
			setSearchParams(params, { replace: true })
		}
	}, [filterConfig, setSearchParams, searchParams])

	const toggleStatus = useCallback((status: string) => {
		setFilterConfig((prev) => {
			const current = prev.status
			if (current.includes(status)) {
				return { ...prev, status: current.filter((s) => s !== status) }
			} else {
				return { ...prev, status: [...current, status] }
			}
		})
	}, [])

	const getCurrentStatus = useCallback((app: Application): ApplicationStatus | 'Unknown' => {
		if (!app.statusHistory || app.statusHistory.length === 0) return 'Unknown'
		return app.statusHistory[0].status // Backend sorts history by date desc
	}, [])

	const getLastStatusDate = useCallback((app: Application) => {
		if (!app.statusHistory || app.statusHistory.length === 0) return app.updatedAt
		return app.statusHistory[0].date
	}, [])

	const getStalenessColor = useCallback((statusDate: string, status: string) => {
		const isInactive = ['Offer', 'Rejected', 'Withdrawn'].includes(status)
		if (isInactive) return 'text-muted-foreground'

		const daysSinceUpdate = (new Date().getTime() - new Date(statusDate).getTime()) / (1000 * 3600 * 24)

		if (daysSinceUpdate > 14) return 'text-red-500 font-medium'
		if (daysSinceUpdate > 7) return 'text-yellow-600 font-medium'
		return 'text-muted-foreground'
	}, [])

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

	// Persist view mode to localStorage
	useEffect(() => {
		safeLocalStorage.setItem('dashboard_view_mode', viewMode)
	}, [viewMode])

	// Persist filter config to localStorage
	useEffect(() => {
		safeLocalStorage.setJSON('dashboard_filter_config', filterConfig)
	}, [filterConfig])

	// Persist sort config to localStorage
	useEffect(() => {
		safeLocalStorage.setJSON('dashboard_sort_config', sortConfig)
	}, [sortConfig])

	// Persist controls open state to localStorage
	useEffect(() => {
		safeLocalStorage.setItem('dashboard_controls_open', isFiltersOpen.toString())
	}, [isFiltersOpen])

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

	if (isLoading) return <div className="p-8 text-center">Loading applications...</div>
	if (error) return <div className="p-8 text-center text-destructive">Error loading applications</div>

	return (
		<div className="space-y-6">
			<div className="flex gap-4 justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
					<p className="hidden sm:block text-muted-foreground">Overview of your job applications.</p>
				</div>

				<Link
					to="/applications/new"
					className={cn(
						buttonVariants({ variant: 'default', size: 'lg' }),
						'hidden sm:flex items-center gap-2',
					)}
				>
					<Plus className="h-4 w-4" /> New Application
				</Link>
				<Link
					to="/applications/new"
					className={cn(buttonVariants({ variant: 'default', size: 'icon-lg' }), 'sm:hidden')}
					aria-label="Create new application"
				>
					<Plus className="h-4 w-4" />
				</Link>
			</div>

			<div className="flex flex-col md:flex-row gap-6">
				{/* Main Content */}
				<div className="flex-1">
					<div className="flex items-center justify-between gap-2 mb-4">
						<Button
							onClick={() => setIsFiltersOpen(!isFiltersOpen)}
							variant="secondary"
							aria-pressed={isFiltersOpen}
							title={isFiltersOpen ? 'Hide Controls' : 'Show Controls'}
						>
							<Cog className="h-4 w-4" />
							{isFiltersOpen ? 'Hide Controls' : 'Show Controls'}
						</Button>

						<div className="flex items-center" role="group" aria-label="View mode toggle">
							<Button
								variant={viewMode === 'table' ? 'secondary' : 'ghost'}
								onClick={() => setViewMode('table')}
								aria-pressed={viewMode === 'table'}
								title="Table view"
								className="hidden sm:inline-flex"
							>
								<TableIcon className="h-4 w-4" aria-hidden="true" /> Table view
							</Button>
							<Button
								variant={viewMode === 'card' ? 'secondary' : 'ghost'}
								onClick={() => setViewMode('card')}
								aria-pressed={viewMode === 'card'}
								title="Card view"
								className="hidden sm:inline-flex"
							>
								<LayoutGrid className="h-4 w-4" aria-hidden="true" /> Card view
							</Button>
							<Button
								variant={viewMode === 'table' ? 'secondary' : 'ghost'}
								size="icon"
								onClick={() => setViewMode('table')}
								aria-pressed={viewMode === 'table'}
								aria-label="Table view"
								className="sm:hidden"
							>
								<TableIcon className="h-4 w-4" aria-hidden="true" />
							</Button>
							<Button
								variant={viewMode === 'card' ? 'secondary' : 'ghost'}
								size="icon"
								onClick={() => setViewMode('card')}
								aria-pressed={viewMode === 'card'}
								aria-label="Card view"
								className="sm:hidden"
							>
								<LayoutGrid className="h-4 w-4" aria-hidden="true" />
							</Button>
						</div>
					</div>

					<div className="flex flex-col lg:flex-row items-start justify-between gap-6">
						{/* Sidebar / Filters */}
						<aside className={cn('w-full lg:w-64 flex-none space-y-4', isFiltersOpen ? 'block' : 'hidden')}>
							<div className="bg-muted/30 p-4 rounded-lg border space-y-4">
								<h3 className="font-semibold mb-2 flex items-center gap-2">
									<FilterIcon className="h-4 w-4" /> Filters
								</h3>

								<div className="space-y-2">
									<label
										id="company-filter-label"
										htmlFor="company-filter-select"
										className="text-xs text-muted-foreground uppercase tracking-wider font-semibold"
									>
										Company
									</label>
									<Select
										id="company-filter-select"
										value={filterConfig.company || 'all'}
										onValueChange={(val) =>
											setFilterConfig((prev) => ({
												...prev,
												company: val === 'all' || val === null ? '' : val,
											}))
										}
									>
										<SelectTrigger
											aria-labelledby="company-filter-label"
											className="h-9 w-full bg-background"
										>
											<SelectValue placeholder="All Companies">
												{filterConfig.company || 'All Companies'}
											</SelectValue>
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all" label="All Companies">
												All Companies
											</SelectItem>
											{uniqueCompanies.map((company) => (
												<SelectItem key={company} value={company} label={company}>
													{company}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-3 pt-2">
									<Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
										Status
									</Label>
									<div className="space-y-2">
										{APPLICATION_STATUS_OPTIONS.map((status) => (
											<div key={`chk-${status}`} className="flex items-center space-x-2">
												<Checkbox
													id={`status-chk-${status}`}
													checked={filterConfig.status.includes(status)}
													onCheckedChange={() => toggleStatus(status)}
												/>
												<Label
													htmlFor={`status-chk-${status}`}
													className="font-normal text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
												>
													{status}
												</Label>
											</div>
										))}
									</div>
								</div>

								{(filterConfig.company || filterConfig.status.length > 0) && (
									<Button
										variant="ghost"
										onClick={() =>
											setFilterConfig({
												company: '',
												status: [],
											})
										}
										className="w-full h-9"
									>
										Reset Filters
										<X className="ml-2 h-4 w-4" />
									</Button>
								)}
							</div>

							<div className="bg-muted/30 p-4 rounded-lg border space-y-4">
								<h3 className="font-semibold mb-2 flex items-center gap-2">
									<ArrowUpDown className="h-4 w-4" /> Sort
								</h3>

								<div className="space-y-2">
									<label id="sort-field-label" className="text-sm font-medium leading-none">
										Sort By
									</label>
									<Select
										value={sortConfig.key}
										onValueChange={(val) =>
											setSortConfig((prev) => ({ ...prev, key: val as SortKey }))
										}
									>
										<SelectTrigger
											aria-labelledby="sort-field-label"
											className="h-9 w-full bg-background"
										>
											<SelectValue placeholder="Select field">
												{SORT_OPTIONS.find((opt) => opt.value === sortConfig.key)?.label}
											</SelectValue>
										</SelectTrigger>
										<SelectContent>
											{SORT_OPTIONS.map((opt) => (
												<SelectItem key={opt.value} value={opt.value} label={opt.label}>
													{opt.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2">
									<label id="sort-direction-label" className="text-sm font-medium leading-none">
										Direction
									</label>
									<Select
										value={sortConfig.direction}
										onValueChange={(val) =>
											setSortConfig((prev) => ({
												...prev,
												direction: val as SortDirection,
											}))
										}
									>
										<SelectTrigger
											aria-labelledby="sort-direction-label"
											className="h-9 w-full bg-background"
										>
											<SelectValue placeholder="Select direction">
												{
													DIRECTION_OPTIONS.find((opt) => opt.value === sortConfig.direction)
														?.label
												}
											</SelectValue>
										</SelectTrigger>
										<SelectContent>
											{DIRECTION_OPTIONS.map((opt) => (
												<SelectItem key={opt.value} value={opt.value} label={opt.label}>
													{opt.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
						</aside>

						{viewMode === 'table' ? (
							<div className="grow rounded-md border">
								<div className="relative w-full overflow-auto">
									<table className="w-full caption-bottom text-sm">
										<thead className="[&_tr]:border-b">
											<tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
												<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
													Company
												</th>
												<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
													Job Title
												</th>
												<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
													Status
												</th>
												<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
													Last Status Update
												</th>
											</tr>
										</thead>
										<tbody className="[&_tr:last-child]:border-0">
											{filteredAndSortedApplications.length === 0 ? (
												<tr>
													<td colSpan={4} className="h-24 text-center">
														No applications found matching your criteria.
													</td>
												</tr>
											) : (
												filteredAndSortedApplications.map((app) => {
													const currentStatus = getCurrentStatus(app)
													const lastStatusDate = getLastStatusDate(app)
													return (
														<ApplicationRow
															key={app.id}
															app={app}
															currentStatus={currentStatus}
															lastStatusDate={lastStatusDate}
															stalenessColor={getStalenessColor(
																lastStatusDate,
																currentStatus,
															)}
															onClick={() => handleNavigate(app.id)}
															onMouseEnter={() => handlePrefetch(app.id)}
														/>
													)
												})
											)}
										</tbody>
									</table>
								</div>
							</div>
						) : (
							<div className="grow w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
								{filteredAndSortedApplications.length === 0 ? (
									<p className="col-span-full text-center py-12 text-muted-foreground border rounded-lg bg-muted/10">
										No applications found matching your criteria.
									</p>
								) : (
									filteredAndSortedApplications.map((app) => {
										const currentStatus = getCurrentStatus(app)
										const lastStatusDate = getLastStatusDate(app)
										return (
											<ApplicationCard
												key={app.id}
												app={app}
												currentStatus={currentStatus}
												lastStatusDate={lastStatusDate}
												stalenessColor={getStalenessColor(lastStatusDate, currentStatus)}
												onClick={() => handleNavigate(app.id)}
												onMouseEnter={() => handlePrefetch(app.id)}
											/>
										)
									})
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
