import { ArrowUpDown, Filter as FilterIcon, LayoutGrid, Plus, Table as TableIcon, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Badge } from '../components/ui/badge'
import { Button, buttonVariants } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { useApplications } from '../hooks/useApplications'
import { cn, formatDisplayDate } from '../lib/utils'
import type { Application } from '../types'

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

const DAYS_AGO_OPTIONS = [
	{ value: 'all', label: 'Any time' },
	{ value: '7', label: 'Last 7 days' },
	{ value: '14', label: 'Last 14 days' },
	{ value: '30', label: 'Last 30 days' },
]

interface SortConfig {
	key: SortKey
	direction: SortDirection
}

interface FilterConfig {
	company: string
	status: string // "all" or specific status
	daysAgo: string // "all", "7", "14", "30"
}

export default function Dashboard() {
	const navigate = useNavigate()
	const { data: applications = [], isLoading, error } = useApplications()

	const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
	const [sortConfig, setSortConfig] = useState<SortConfig>({
		key: 'lastStatusUpdate',
		direction: 'desc',
	})
	const [filterConfig, setFilterConfig] = useState<FilterConfig>({
		company: '',
		status: 'all',
		daysAgo: 'all',
	})
	const [isFiltersOpen, setIsFiltersOpen] = useState(false)

	const getCurrentStatus = (app: Application) => {
		if (!app.statusHistory || app.statusHistory.length === 0) return 'Unknown'
		return app.statusHistory[0].status // Backend sorts history by date desc
	}

	const getLastStatusDate = (app: Application) => {
		if (!app.statusHistory || app.statusHistory.length === 0) return app.updatedAt
		return app.statusHistory[0].date
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'Offer':
				return 'bg-green-100 text-green-800 hover:bg-green-100/80 border-transparent dark:bg-green-900/30 dark:text-green-400'
			case 'Rejected':
				return 'destructive'
			case 'Withdrawn':
				return 'secondary'
			default:
				return 'outline'
		}
	}

	const getStalenessColor = (statusDate: string, status: string) => {
		const isInactive = ['Offer', 'Rejected', 'Withdrawn'].includes(status)
		if (isInactive) return 'text-muted-foreground'

		const daysSinceUpdate = (new Date().getTime() - new Date(statusDate).getTime()) / (1000 * 3600 * 24)

		if (daysSinceUpdate > 14) return 'text-red-500 font-medium'
		if (daysSinceUpdate > 7) return 'text-yellow-600 font-medium'
		return 'text-muted-foreground'
	}

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

		if (filterConfig.status !== 'all') {
			result = result.filter((app) => getCurrentStatus(app) === filterConfig.status)
		}

		if (filterConfig.daysAgo !== 'all') {
			const days = parseInt(filterConfig.daysAgo)
			const cutoffDate = new Date()
			cutoffDate.setDate(cutoffDate.getDate() - days)
			result = result.filter((app) => new Date(getLastStatusDate(app)) >= cutoffDate)
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
	}, [applications, sortConfig, filterConfig])

	if (isLoading) return <div className="p-8 text-center">Loading applications...</div>
	if (error) return <div className="p-8 text-center text-destructive">Error loading applications</div>

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
					<p className="text-muted-foreground">Overview of your job applications.</p>
				</div>
				<Link to="/applications/new" className={cn(buttonVariants(), 'w-full sm:w-auto')}>
					<Plus className="mr-2 h-4 w-4" /> New Application
				</Link>
			</div>

			<div className="flex flex-col md:flex-row gap-6">
				{/* Sidebar / Filters */}
				<aside
					className={cn('w-full md:w-64 flex-none space-y-4', isFiltersOpen ? 'block' : 'hidden md:block')}
				>
					<div className="bg-muted/30 p-4 rounded-lg border space-y-4">
						<h3 className="font-semibold mb-2 flex items-center gap-2">
							<FilterIcon className="h-4 w-4" /> Filters
						</h3>

						<div className="space-y-2">
							<label id="company-filter-label" className="text-sm font-medium leading-none">
								Company
							</label>
							<Select
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

						<div className="space-y-2">
							<label id="status-filter-label" className="text-sm font-medium leading-none">
								Status
							</label>
							<Select
								value={filterConfig.status}
								onValueChange={(val) => setFilterConfig((prev) => ({ ...prev, status: val || 'all' }))}
							>
								<SelectTrigger
									aria-labelledby="status-filter-label"
									className="h-9 w-full bg-background"
								>
									<SelectValue placeholder="All Statuses">
										{filterConfig.status === 'all' ? 'All Statuses' : filterConfig.status}
									</SelectValue>
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all" label="All Statuses">
										All Statuses
									</SelectItem>
									<SelectItem value="Applied" label="Applied">
										Applied
									</SelectItem>
									<SelectItem value="Phone Screen" label="Phone Screen">
										Phone Screen
									</SelectItem>
									<SelectItem value="Technical Interview" label="Technical Interview">
										Technical Interview
									</SelectItem>
									<SelectItem value="On-site Interview" label="On-site Interview">
										On-site Interview
									</SelectItem>
									<SelectItem value="Offer" label="Offer">
										Offer
									</SelectItem>
									<SelectItem value="Rejected" label="Rejected">
										Rejected
									</SelectItem>
									<SelectItem value="Withdrawn" label="Withdrawn">
										Withdrawn
									</SelectItem>
									<SelectItem value="Other" label="Other">
										Other
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<label id="updated-filter-label" className="text-sm font-medium leading-none">
								Last Status Update
							</label>
							<Select
								value={filterConfig.daysAgo}
								onValueChange={(val) =>
									setFilterConfig((prev) => ({
										...prev,
										daysAgo: val || 'all',
									}))
								}
							>
								<SelectTrigger
									aria-labelledby="updated-filter-label"
									className="h-9 w-full bg-background"
								>
									<SelectValue placeholder="Any time">
										{DAYS_AGO_OPTIONS.find((opt) => opt.value === filterConfig.daysAgo)?.label}
									</SelectValue>
								</SelectTrigger>
								<SelectContent>
									{DAYS_AGO_OPTIONS.map((opt) => (
										<SelectItem key={opt.value} value={opt.value} label={opt.label}>
											{opt.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{(filterConfig.company || filterConfig.status !== 'all' || filterConfig.daysAgo !== 'all') && (
							<Button
								variant="ghost"
								onClick={() =>
									setFilterConfig({
										company: '',
										status: 'all',
										daysAgo: 'all',
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
								onValueChange={(val) => setSortConfig((prev) => ({ ...prev, key: val as SortKey }))}
							>
								<SelectTrigger aria-labelledby="sort-field-label" className="h-9 w-full bg-background">
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
										{DIRECTION_OPTIONS.find((opt) => opt.value === sortConfig.direction)?.label}
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

				{/* Main Content */}
				<div className="flex-1 overflow-hidden">
					<div className="flex items-center justify-between mb-4">
						{/* Mobile Toggle Button */}
						<div className="md:hidden">
							<Button onClick={() => setIsFiltersOpen(!isFiltersOpen)} variant="outline" size="sm">
								<FilterIcon className="mr-2 h-4 w-4" />
								{isFiltersOpen ? 'Hide Controls' : 'Show Controls'}
							</Button>
						</div>

						<div
							className="flex items-center bg-muted/50 p-1 rounded-lg border ml-auto"
							role="group"
							aria-label="View mode toggle"
						>
							<Button
								variant={viewMode === 'table' ? 'secondary' : 'ghost'}
								size="sm"
								className="h-8 w-9 p-0"
								onClick={() => setViewMode('table')}
								aria-pressed={viewMode === 'table'}
								title="Table view"
							>
								<TableIcon className="h-4 w-4" aria-hidden="true" />
								<span className="sr-only">Table view</span>
							</Button>
							<Button
								variant={viewMode === 'card' ? 'secondary' : 'ghost'}
								size="sm"
								className="h-8 w-9 p-0"
								onClick={() => setViewMode('card')}
								aria-pressed={viewMode === 'card'}
								title="Card view"
							>
								<LayoutGrid className="h-4 w-4" aria-hidden="true" />
								<span className="sr-only">Card view</span>
							</Button>
						</div>
					</div>

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
													<tr
														key={app.id}
														className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted cursor-pointer"
														onClick={() => navigate(`/applications/${app.id}`)}
													>
														<td className="p-4 align-middle font-medium">{app.company}</td>
														<td className="p-4 align-middle">{app.jobTitle}</td>
														<td className="p-4 align-middle">
															<Badge
																variant={
																	getStatusColor(currentStatus) as
																		| 'default'
																		| 'destructive'
																		| 'secondary'
																		| 'outline'
																}
																className={
																	getStatusColor(currentStatus) !== 'destructive' &&
																	getStatusColor(currentStatus) !== 'secondary' &&
																	getStatusColor(currentStatus) !== 'outline'
																		? getStatusColor(currentStatus)
																		: ''
																}
															>
																{currentStatus}
															</Badge>
														</td>
														<td
															className={`p-4 align-middle ${getStalenessColor(lastStatusDate, currentStatus)}`}
														>
															{formatDisplayDate(lastStatusDate)}
														</td>
													</tr>
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
										<Card
											key={app.id}
											className="cursor-pointer hover:border-primary/50 transition-colors border ring-0"
											onClick={() => navigate(`/applications/${app.id}`)}
										>
											<CardHeader className="pb-2">
												<div className="flex justify-between items-start gap-2">
													<CardTitle className="text-lg truncate">{app.company}</CardTitle>
													<Badge
														variant={
															getStatusColor(currentStatus) as
																| 'default'
																| 'destructive'
																| 'secondary'
																| 'outline'
														}
														className={
															getStatusColor(currentStatus) !== 'destructive' &&
															getStatusColor(currentStatus) !== 'secondary' &&
															getStatusColor(currentStatus) !== 'outline'
																? getStatusColor(currentStatus)
																: ''
														}
													>
														{currentStatus}
													</Badge>
												</div>
												<p className="text-sm text-muted-foreground truncate">{app.jobTitle}</p>
											</CardHeader>
											<CardContent>
												<div className="text-xs text-muted-foreground flex items-center gap-2">
													<span>Last Update:</span>
													<span className={getStalenessColor(lastStatusDate, currentStatus)}>
														{formatDisplayDate(lastStatusDate)}
													</span>
												</div>
											</CardContent>
										</Card>
									)
								})
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
