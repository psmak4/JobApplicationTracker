import { AxiosError } from 'axios'

/**
 * Extracts a user-friendly error message from an Axios error or generic error.
 * Handles common API error response formats.
 *
 * @param error - The error object (typically from a catch block)
 * @param fallbackMessage - Default message if no specific error message is found
 * @returns A user-friendly error message string
 */
export function getErrorMessage(error: unknown, fallbackMessage = 'An unexpected error occurred'): string {
	// Handle Axios errors with response data
	if (error instanceof AxiosError) {
		const data = error.response?.data

		// Handle common API error response formats
		if (data) {
			// Format: { message: "Error message" }
			if (typeof data.message === 'string') {
				return data.message
			}

			// Format: { error: "Error message" }
			if (typeof data.error === 'string') {
				return data.error
			}

			// Format: { errors: { field: { _errors: ["message"] } } } (Zod format)
			if (data.errors && typeof data.errors === 'object') {
				const firstError = Object.values(data.errors)[0] as { _errors?: string[] } | undefined
				if (firstError?._errors?.[0]) {
					return firstError._errors[0]
				}
			}
		}

		// Fallback to Axios error message
		if (error.message) {
			return error.message
		}
	}

	// Handle standard Error objects
	if (error instanceof Error) {
		return error.message
	}

	// Handle string errors
	if (typeof error === 'string') {
		return error
	}

	return fallbackMessage
}

/**
 * Type guard to check if an error is an Axios error
 */
export function isAxiosError(error: unknown): error is AxiosError {
	return error instanceof AxiosError
}

/**
 * Check if an error is a network error (no response from server)
 */
export function isNetworkError(error: unknown): boolean {
	if (error instanceof AxiosError) {
		return !error.response && error.code !== 'ERR_CANCELED'
	}
	return false
}

/**
 * Check if an error is an authentication error (401)
 */
export function isAuthError(error: unknown): boolean {
	if (error instanceof AxiosError) {
		return error.response?.status === 401
	}
	return false
}

/**
 * Check if an error is a rate limit error (429)
 */
export function isRateLimitError(error: unknown): boolean {
	if (error instanceof AxiosError) {
		return error.response?.status === 429
	}
	return false
}
