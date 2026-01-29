import { ArrowDown, ArrowUp, Check, LayoutGrid, RotateCcw, SlidersHorizontal, Table as TableIcon } from 'lucide-react'
import { useState } from 'react'
import { APPLICATION_STATUS_OPTIONS } from '@/constants'
import type { FilterConfig, SortConfig, SortKey } from '@/hooks/useDashboardFilters'
import { SORT_OPTIONS } from '@/hooks/useDashboardFilters'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet'

interface DashboardMobileFiltersProps {
	filterConfig: FilterConfig
	sortConfig: SortConfig
	viewMode: 'table' | 'card'
	activeFilterCount: number
	uniqueCompanies: string[]
	filteredCount: number
	onFilterChange: React.Dispatch<React.SetStateAction<FilterConfig>>
	onSortChange: React.Dispatch<React.SetStateAction<SortConfig>>
	onViewModeChange: React.Dispatch<React.SetStateAction<'table' | 'card'>>
	onToggleStatus: (status: string) => void
	onResetFilters: () => void
}

/**
 * Mobile toolbar with sheet-based filters for Dashboard
 */
export function DashboardMobileFilters({
	filterConfig,
	sortConfig,
	viewMode,
	activeFilterCount,
	uniqueCompanies,
	filteredCount,
	onFilterChange,
	onSortChange,
	onViewModeChange,
	onToggleStatus,
	onResetFilters,
}: DashboardMobileFiltersProps) {
	const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

	return (
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
									onFilterChange((prev) => ({
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
							<div className="space-y-2">
								{APPLICATION_STATUS_OPTIONS.map((status) => (
									<div key={`mobile-chk-${status}`} className="flex items-center space-x-2">
										<Checkbox
											id={`mobile-status-chk-${status}`}
											checked={filterConfig.status.includes(status)}
											onCheckedChange={() => onToggleStatus(status)}
										/>
										<Label
											htmlFor={`mobile-status-chk-${status}`}
											className="font-normal text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
										>
											{status}
										</Label>
									</div>
								))}
							</div>
						</div>

						{/* Sort */}
						<div className="space-y-2">
							<Label className="text-sm font-medium">Sort By</Label>
							<Select
								value={sortConfig.key}
								onValueChange={(val) => onSortChange((prev) => ({ ...prev, key: val as SortKey }))}
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
									onClick={() => onSortChange((prev) => ({ ...prev, direction: 'desc' }))}
									className="flex-1 h-10"
								>
									<ArrowDown className="h-4 w-4 mr-2" />
									Newest First
								</Button>
								<Button
									variant={sortConfig.direction === 'asc' ? 'secondary' : 'outline'}
									onClick={() => onSortChange((prev) => ({ ...prev, direction: 'asc' }))}
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
							onClick={onResetFilters}
							className="flex-1"
							disabled={activeFilterCount === 0}
						>
							<RotateCcw className="h-4 w-4 mr-2" />
							Reset All
						</Button>
						<Button onClick={() => setMobileFiltersOpen(false)} className="flex-1">
							<Check className="h-4 w-4 mr-2" />
							Apply ({filteredCount})
						</Button>
					</div>
				</SheetContent>
			</Sheet>

			{/* View Toggle (Mobile) */}
			<div className="flex items-center border rounded-md">
				<Button
					variant={viewMode === 'table' ? 'secondary' : 'ghost'}
					size="icon"
					onClick={() => onViewModeChange('table')}
					className="rounded-r-none h-9 w-9"
					aria-label="Table view"
					aria-pressed={viewMode === 'table'}
				>
					<TableIcon className="h-4 w-4" />
				</Button>
				<Button
					variant={viewMode === 'card' ? 'secondary' : 'ghost'}
					size="icon"
					onClick={() => onViewModeChange('card')}
					className="rounded-l-none h-9 w-9"
					aria-label="Card view"
					aria-pressed={viewMode === 'card'}
				>
					<LayoutGrid className="h-4 w-4" />
				</Button>
			</div>
		</div>
	)
}
