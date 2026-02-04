import axios from 'axios'
import { toast } from 'sonner'
// Helper to extract data from standardized API response
import type { ApiSuccessResponse } from '@/types'

const apiClient = axios.create({
	baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
	withCredentials: true,
})

// Track if we've shown a rate limit warning recently
// Using a Map to track per-session to avoid memory leaks across page refreshes
const warningState = {
	rateLimitShown: false,
	timeoutId: null as ReturnType<typeof setTimeout> | null,
}

// Add request interceptor to handle slow requests
apiClient.interceptors.request.use((config) => {
	// Add request timestamp for timing
	config.metadata = { startTime: Date.now() }
	return config
})

// Add response interceptor to handle rate limiting, slowdowns, and errors
apiClient.interceptors.response.use(
	(response) => {
		const endTime = Date.now()
		const startTime = response.config.metadata?.startTime || endTime
		const duration = endTime - startTime

		// Reset rate limit warning if request succeeds
		if (warningState.rateLimitShown && warningState.timeoutId) {
			clearTimeout(warningState.timeoutId)
			warningState.timeoutId = null
			warningState.rateLimitShown = false
		}

		// Warn user if request took longer than 3 seconds (likely being slowed down)
		if (duration > 3000 && !warningState.rateLimitShown) {
			toast.warning('Slow Response', {
				description: 'You may be making requests too quickly. Consider slowing down.',
				duration: 3000,
			})
		}

		return response
	},
	(error) => {
		// Handle rate limit errors (429)
		if (error.response?.status === 429) {
			const data = error.response.data
			const retryAfter = data?.retryAfter || 60
			const message = data?.message || 'Too many requests. Please try again later.'

			// Format retry time
			const minutes = Math.floor(retryAfter / 60)
			const seconds = retryAfter % 60
			let retryText = ''
			if (minutes > 0) {
				retryText = `${minutes} minute${minutes > 1 ? 's' : ''}`
				if (seconds > 0) {
					retryText += ` and ${seconds} second${seconds > 1 ? 's' : ''}`
				}
			} else {
				retryText = `${seconds} second${seconds > 1 ? 's' : ''}`
			}

			// Show detailed error
			toast.error('Rate Limit Exceeded', {
				description: `${message} Please wait ${retryText}.`,
				duration: 5000,
			})

			// Set flag to prevent spam
			warningState.rateLimitShown = true
			if (warningState.timeoutId) {
				clearTimeout(warningState.timeoutId)
			}
			warningState.timeoutId = setTimeout(() => {
				warningState.rateLimitShown = false
			}, 5000)
		}

		// Handle authentication errors
		if (error.response?.status === 401) {
			toast.error('Authentication required', {
				description: 'Please log in to continue.',
			})
		}

		return Promise.reject(error)
	},
)

// Extend axios types to include metadata
declare module 'axios' {
	export interface AxiosRequestConfig {
		metadata?: {
			startTime: number
		}
	}
}

export const extractData = <T>(response: ApiSuccessResponse<T>): T => response.data

export default apiClient
