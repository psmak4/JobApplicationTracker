import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function formatDisplayDate(dateString: string) {
	if (!dateString) return ''

	const [datePart] = dateString.split('T') // handles both YYYY-MM-DD and full ISO
	const [year, month, day] = datePart.split('-').map(Number)

	return new Date(year, month - 1, day).toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	})
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
