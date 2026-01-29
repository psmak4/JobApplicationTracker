import {
	ArrowDown,
	ArrowUp,
	ArrowUpDown,
	Check,
	Filter as FilterIcon,
	LayoutGrid,
	Plus,
	RotateCcw,
	SlidersHorizontal,
	Table as TableIcon,
} from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import ApplicationStatusBadge from '@/components/ApplicationStatusBadge'
import { APPLICATION_STATUS_OPTIONS } from '@/constants'
import { Badge } from '../components/ui/badge'
import { Button, buttonVariants } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Checkbox } from '../components/ui/checkbox'
import { Label } from '../components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet'
import { useApplicationPrefetch, useApplications } from '../hooks/useApplications'
import { cn, formatDisplayDate, safeLocalStorage } from '../lib/utils'
import type { Application, ApplicationStatus } from '../types'

type SortKey = 'company' | 'status' | 'lastStatusUpdate'
type SortDirection = 'asc' | 'desc'

const SORT_OPTIONS: { value: SortKey; label: string; shortLabel: string }[] = [
	{ value: 'lastStatusUpdate', label: 'Last Status Update', shortLabel: 'Last Update' },
	{ value: 'company', label: 'Company', shortLabel: 'Company' },
	{ value: 'status', label: 'Status', shortLabel: 'Status' },
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

// Status filter popover content - reused for desktop popover and mobile sheet
function StatusFilterContent({
	filterConfig,
	toggleStatus,
}: {
	filterConfig: FilterConfig
	toggleStatus: (status: string) => void
}) {
	return (
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
	)
}

export default function Dashboard() {
	const navigate = useNavigate()
	const [searchParams, setSearchParams] = useSearchParams()
	const { data: applications = [], isLoading, error } = useApplications()
	const prefetchApplication = useApplicationPrefetch()
	const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

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

	const resetFilters = useCallback(() => {
		setFilterConfig({ company: '', status: [] })
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

	const activeFilterCount = (filterConfig.company ? 1 : 0) + filterConfig.status.length

	const toggleSortDirection = useCallback(() => {
		setSortConfig((prev) => ({
			...prev,
			direction: prev.direction === 'asc' ? 'desc' : 'asc',
		}))
	}, [])

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
			<div className="hidden md:flex items-center gap-3 flex-wrap">
				{/* Company Filter */}
				<Select
					value={filterConfig.company || 'all'}
					onValueChange={(val) =>
						setFilterConfig((prev) => ({
							...prev,
							company: val === 'all' || val === null ? '' : val,
						}))
					}
				>
					<SelectTrigger className="w-[180px] h-9 bg-background">
						<SelectValue placeholder="All Companies">{filterConfig.company || 'All Companies'}</SelectValue>
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

				{/* Status Filter Popover */}
				<Popover>
					<PopoverTrigger
						render={
							<Button variant="outline" className="h-9 gap-2">
								<FilterIcon className="h-4 w-4" />
								Status
								{filterConfig.status.length > 0 && (
									<Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
										{filterConfig.status.length}
									</Badge>
								)}
							</Button>
						}
					/>
					<PopoverContent className="w-56" align="start">
						<div className="space-y-3">
							<div className="font-medium text-sm">Filter by Status</div>
							<StatusFilterContent filterConfig={filterConfig} toggleStatus={toggleStatus} />
							{filterConfig.status.length > 0 && (
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setFilterConfig((prev) => ({ ...prev, status: [] }))}
									className="w-full h-8 text-xs"
								>
									Clear Status Filters
								</Button>
							)}
						</div>
					</PopoverContent>
				</Popover>

				{/* Reset Filters */}
				{activeFilterCount > 0 && (
					<Button
						variant="ghost"
						size="sm"
						onClick={resetFilters}
						className="h-9 gap-1 text-muted-foreground"
					>
						<RotateCcw className="h-3.5 w-3.5" />
						Reset
					</Button>
				)}

				{/* Spacer */}
				<div className="flex-1" />

				{/* Sort Controls */}
				<div className="flex items-center gap-1">
					<Select
						value={sortConfig.key}
						onValueChange={(val) => setSortConfig((prev) => ({ ...prev, key: val as SortKey }))}
					>
						<SelectTrigger className="w-[160px] h-9 bg-background">
							<div className="flex items-center gap-2">
								<ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
								<SelectValue>
									{SORT_OPTIONS.find((opt) => opt.value === sortConfig.key)?.shortLabel}
								</SelectValue>
							</div>
						</SelectTrigger>
						<SelectContent>
							{SORT_OPTIONS.map((opt) => (
								<SelectItem key={opt.value} value={opt.value} label={opt.label}>
									{opt.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Button
						variant="outline"
						size="icon"
						onClick={toggleSortDirection}
						className="h-9 w-9"
						aria-label={sortConfig.direction === 'asc' ? 'Sort ascending' : 'Sort descending'}
					>
						{sortConfig.direction === 'asc' ? (
							<ArrowUp className="h-4 w-4" />
						) : (
							<ArrowDown className="h-4 w-4" />
						)}
					</Button>
				</div>

				{/* View Toggle */}
				<div className="flex items-center border rounded-md">
					<Button
						variant={viewMode === 'table' ? 'secondary' : 'ghost'}
						size="sm"
						onClick={() => setViewMode('table')}
						className="rounded-r-none h-9"
						aria-pressed={viewMode === 'table'}
					>
						<TableIcon className="h-4 w-4 mr-1.5" />
						Table
					</Button>
					<Button
						variant={viewMode === 'card' ? 'secondary' : 'ghost'}
						size="sm"
						onClick={() => setViewMode('card')}
						className="rounded-l-none h-9"
						aria-pressed={viewMode === 'card'}
					>
						<LayoutGrid className="h-4 w-4 mr-1.5" />
						Cards
					</Button>
				</div>
			</div>

			{/* Mobile Toolbar */}
			<div className="flex md:hidden items-center gap-2">
				{/* Filters Sheet Trigger */}
				<Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
					<SheetTrigger
						render={
							<Button variant="outline" className="h-9 gap-2">
								<SlidersHorizontal className="h-4 w-4" />
								Filters & Sort
								{activeFilterCount > 0 && (
									<Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
										{activeFilterCount}
									</Badge>
								)}
							</Button>
						}
					/>
					<SheetContent side="bottom" className="h-[85vh] rounded-t-xl">
						<SheetHeader>
							<SheetTitle>Filters & Sort</SheetTitle>
							<SheetDescription>Customize how applications are displayed</SheetDescription>
						</SheetHeader>
						<div className="mt-6 px-4 space-y-6 overflow-y-auto pb-24">
							{/* Company Filter */}
							<div className="space-y-2">
								<Label className="text-sm font-medium">Company</Label>
								<Select
									value={filterConfig.company || 'all'}
									onValueChange={(val) =>
										setFilterConfig((prev) => ({
											...prev,
											company: val === 'all' || val === null ? '' : val,
										}))
									}
								>
									<SelectTrigger className="h-10 w-full bg-background">
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

							{/* Status Filter */}
							<div className="space-y-3">
								<Label className="text-sm font-medium">Status</Label>
								<StatusFilterContent filterConfig={filterConfig} toggleStatus={toggleStatus} />
							</div>

							{/* Sort */}
							<div className="space-y-2">
								<Label className="text-sm font-medium">Sort By</Label>
								<Select
									value={sortConfig.key}
									onValueChange={(val) => setSortConfig((prev) => ({ ...prev, key: val as SortKey }))}
								>
									<SelectTrigger className="h-10 w-full bg-background">
										<SelectValue>
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

							{/* Sort Direction */}
							<div className="space-y-2">
								<Label className="text-sm font-medium">Direction</Label>
								<div className="flex gap-2">
									<Button
										variant={sortConfig.direction === 'desc' ? 'secondary' : 'outline'}
										onClick={() => setSortConfig((prev) => ({ ...prev, direction: 'desc' }))}
										className="flex-1 h-10"
									>
										<ArrowDown className="h-4 w-4 mr-2" />
										Newest First
									</Button>
									<Button
										variant={sortConfig.direction === 'asc' ? 'secondary' : 'outline'}
										onClick={() => setSortConfig((prev) => ({ ...prev, direction: 'asc' }))}
										className="flex-1 h-10"
									>
										<ArrowUp className="h-4 w-4 mr-2" />
										Oldest First
									</Button>
								</div>
							</div>
						</div>

						{/* Fixed bottom actions */}
						<div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t flex gap-3">
							<Button
								variant="outline"
								onClick={resetFilters}
								className="flex-1"
								disabled={activeFilterCount === 0}
							>
								<RotateCcw className="h-4 w-4 mr-2" />
								Reset All
							</Button>
							<Button onClick={() => setMobileFiltersOpen(false)} className="flex-1">
								<Check className="h-4 w-4 mr-2" />
								Apply ({filteredAndSortedApplications.length})
							</Button>
						</div>
					</SheetContent>
				</Sheet>

				{/* View Toggle (Mobile) */}
				<div className="flex items-center border rounded-md">
					<Button
						variant={viewMode === 'table' ? 'secondary' : 'ghost'}
						size="icon"
						onClick={() => setViewMode('table')}
						className="rounded-r-none h-9 w-9"
						aria-label="Table view"
						aria-pressed={viewMode === 'table'}
					>
						<TableIcon className="h-4 w-4" />
					</Button>
					<Button
						variant={viewMode === 'card' ? 'secondary' : 'ghost'}
						size="icon"
						onClick={() => setViewMode('card')}
						className="rounded-l-none h-9 w-9"
						aria-label="Card view"
						aria-pressed={viewMode === 'card'}
					>
						<LayoutGrid className="h-4 w-4" />
					</Button>
				</div>
			</div>

			{/* Results Count */}
			<div className="text-sm text-muted-foreground">
				{filteredAndSortedApplications.length} application
				{filteredAndSortedApplications.length !== 1 ? 's' : ''}
				{activeFilterCount > 0 && ` (filtered from ${applications.length})`}
			</div>

			{/* Table View */}
			{viewMode === 'table' ? (
				<div className="rounded-md border">
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
												stalenessColor={getStalenessColor(lastStatusDate, currentStatus)}
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
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
	)
}
