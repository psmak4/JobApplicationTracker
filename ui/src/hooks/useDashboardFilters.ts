import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { safeLocalStorage } from '@/lib/utils'
import type { Application, ApplicationStatus } from '@/types'

export type SortKey = 'company' | 'status' | 'lastStatusUpdate'
export type SortDirection = 'asc' | 'desc'

export const SORT_OPTIONS: { value: SortKey; label: string; shortLabel: string }[] = [
	{ value: 'lastStatusUpdate', label: 'Last Status Update', shortLabel: 'Last Update' },
	{ value: 'company', label: 'Company', shortLabel: 'Company' },
	{ value: 'status', label: 'Status', shortLabel: 'Status' },
]

export interface SortConfig {
	key: SortKey
	direction: SortDirection
}

export interface FilterConfig {
	company: string
	status: string[]
}

interface UseDashboardFiltersReturn {
	// State
	sortConfig: SortConfig
	filterConfig: FilterConfig
	activeFilterCount: number

	// Setters
	setSortConfig: React.Dispatch<React.SetStateAction<SortConfig>>
	setFilterConfig: React.Dispatch<React.SetStateAction<FilterConfig>>

	// Actions
	toggleStatus: (status: string) => void
	resetFilters: () => void
	toggleSortDirection: () => void

	// Helpers
	getCurrentStatus: (app: Application) => ApplicationStatus | 'Unknown'
	getLastStatusDate: (app: Application) => string
	getStalenessColor: (statusDate: string, status: string) => string
}

/**
 * Custom hook for managing Dashboard filter, sort, and view state.
 * Syncs filter state to URL query params and persists preferences to localStorage.
 */
export function useDashboardFilters(): UseDashboardFiltersReturn {
	const [searchParams, setSearchParams] = useSearchParams()

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

	// Persist filter config to localStorage
	useEffect(() => {
		safeLocalStorage.setJSON('dashboard_filter_config', filterConfig)
	}, [filterConfig])

	// Persist sort config to localStorage
	useEffect(() => {
		safeLocalStorage.setJSON('dashboard_sort_config', sortConfig)
	}, [sortConfig])

	// Actions
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

	const toggleSortDirection = useCallback(() => {
		setSortConfig((prev) => ({
			...prev,
			direction: prev.direction === 'asc' ? 'desc' : 'asc',
		}))
	}, [])

	// Helpers
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

	// Computed values
	const activeFilterCount = useMemo(() => {
		return (filterConfig.company ? 1 : 0) + filterConfig.status.length
	}, [filterConfig])

	return {
		// State
		sortConfig,
		filterConfig,
		activeFilterCount,

		// Setters
		setSortConfig,
		setFilterConfig,

		// Actions
		toggleStatus,
		resetFilters,
		toggleSortDirection,

		// Helpers
		getCurrentStatus,
		getLastStatusDate,
		getStalenessColor,
	}
}
