import { ArrowDown, ArrowUp, Filter as FilterIcon, RotateCcw } from 'lucide-react'
import { APPLICATION_STATUS_OPTIONS } from '@/constants'
import type { FilterConfig, SortConfig, SortKey } from '@/hooks/useDashboardFilters'
import { SORT_OPTIONS } from '@/hooks/useDashboardFilters'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

interface DashboardToolbarProps {
	filterConfig: FilterConfig
	sortConfig: SortConfig
	activeFilterCount: number
	uniqueCompanies: string[]
	onFilterChange: React.Dispatch<React.SetStateAction<FilterConfig>>
	onSortChange: React.Dispatch<React.SetStateAction<SortConfig>>
	onToggleStatus: (status: string) => void
	onResetFilters: () => void
	onToggleSortDirection: () => void
}

/**
 * Status filter content - reusable for both desktop popover and mobile sheet
 */
export function StatusFilterContent({
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

/**
 * Desktop toolbar for Dashboard - includes filters, sort, and view toggle
 */
export function DashboardToolbar({
	filterConfig,
	sortConfig,
	activeFilterCount,
	uniqueCompanies,
	onFilterChange,
	onSortChange,
	onToggleStatus,
	onResetFilters,
	onToggleSortDirection,
}: DashboardToolbarProps) {
	return (
		<div className="hidden md:flex lg:hidden xl:flex items-center gap-3 flex-wrap">
			{/* Company Filter */}
			<Select
				value={filterConfig.company || 'all'}
				onValueChange={(val) =>
					onFilterChange((prev) => ({
						...prev,
						company: val === 'all' || val === null ? '' : val,
					}))
				}
			>
				<SelectTrigger className="w-[180px]">
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
						<Button variant="outline" className="gap-2">
							<FilterIcon />
							Status
							{filterConfig.status.length > 0 && (
								<Badge variant="secondary" className="ml-1 px-1.5 text-xs">
									{filterConfig.status.length}
								</Badge>
							)}
						</Button>
					}
				/>
				<PopoverContent className="w-56" align="start">
					<div className="space-y-3">
						<div className="font-medium text-sm">Filter by Status</div>
						<StatusFilterContent filterConfig={filterConfig} toggleStatus={onToggleStatus} />
						{filterConfig.status.length > 0 && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => onFilterChange((prev) => ({ ...prev, status: [] }))}
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
				<Button variant="ghost" size="sm" onClick={onResetFilters} className="gap-1 text-muted-foreground">
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
					onValueChange={(val) => onSortChange((prev) => ({ ...prev, key: val as SortKey }))}
				>
					<SelectTrigger className="w-[160px]">
						<SelectValue>
							{SORT_OPTIONS.find((opt) => opt.value === sortConfig.key)?.shortLabel}
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
				<Button
					variant="outline"
					size="icon"
					onClick={onToggleSortDirection}
					aria-label={sortConfig.direction === 'asc' ? 'Sort ascending' : 'Sort descending'}
				>
					{sortConfig.direction === 'asc' ? <ArrowUp /> : <ArrowDown />}
				</Button>
			</div>
		</div>
	)
}
