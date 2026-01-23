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
