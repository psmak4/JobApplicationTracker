import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

type DateFormat = 'short' | 'long' | 'weekday' | 'time'

/**
 * Unified date formatting utility.
 *
 * Formats:
 *   'short'   → "Feb 15, 2026"          (default — compact date)
 *   'long'    → "February 15, 2026"     (full date for detail views)
 *   'weekday' → "Saturday, February 15" (date headers in event lists)
 *   'time'    → "2:30 PM"              (time only)
 */
export function formatDate(dateString: string | Date, format: DateFormat = 'short'): string {
	if (!dateString) return ''

	const date = dateString instanceof Date ? dateString : new Date(dateString)
	if (isNaN(date.getTime())) return ''

	switch (format) {
		case 'long':
			return date.toLocaleDateString(undefined, {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
			})
		case 'weekday':
			return date.toLocaleDateString(undefined, {
				weekday: 'long',
				month: 'long',
				day: 'numeric',
			})
		case 'time':
			return date.toLocaleTimeString(undefined, {
				hour: 'numeric',
				minute: '2-digit',
			})
		case 'short':
		default:
			return date.toLocaleDateString(undefined, {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
			})
	}
}

/**
 * Safe localStorage utilities that handle cases where localStorage is unavailable
 * (incognito mode, storage disabled, quota exceeded, etc.)
 */
export const safeLocalStorage = {
	getItem: (key: string): string | null => {
		try {
			return localStorage.getItem(key)
		} catch {
			return null
		}
	},

	setItem: (key: string, value: string): boolean => {
		try {
			localStorage.setItem(key, value)
			return true
		} catch {
			return false
		}
	},

	removeItem: (key: string): boolean => {
		try {
			localStorage.removeItem(key)
			return true
		} catch {
			return false
		}
	},

	/**
	 * Safely parse a JSON value from localStorage
	 */
	getJSON: <T>(key: string, fallback: T): T => {
		try {
			const item = localStorage.getItem(key)
			if (item === null) return fallback
			return JSON.parse(item) as T
		} catch {
			return fallback
		}
	},

	/**
	 * Safely stringify and store a value in localStorage
	 */
	setJSON: <T>(key: string, value: T): boolean => {
		try {
			localStorage.setItem(key, JSON.stringify(value))
			return true
		} catch {
			return false
		}
	},
}
