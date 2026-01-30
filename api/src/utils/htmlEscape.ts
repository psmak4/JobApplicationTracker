/**
 * Escape HTML special characters to prevent XSS attacks
 * Converts characters that have special meaning in HTML to their entity equivalents
 */
export function escapeHtml(unsafe: string): string {
	if (!unsafe) return ''

	return unsafe
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;')
}

/**
 * Escape HTML in an object of strings
 * Useful for sanitizing multiple user-provided fields at once
 */
export function escapeHtmlObject<T extends Record<string, string>>(obj: T): T {
	const escaped = {} as T
	for (const [key, value] of Object.entries(obj)) {
		escaped[key as keyof T] = escapeHtml(value) as T[keyof T]
	}
	return escaped
}
