import axios from 'axios'
import { toast } from 'sonner'

const apiClient = axios.create({
	baseURL: 'http://localhost:4000/api',
	withCredentials: true,
})

// Track if we've shown a rate limit warning recently
let rateLimitWarningShown = false
let rateLimitWarningTimeout: ReturnType<typeof setTimeout> | null = null

// Add response interceptor to handle rate limiting and slowdowns
apiClient.interceptors.response.use(
	(response) => {
		// Reset rate limit warning if request succeeds
		if (rateLimitWarningShown && rateLimitWarningTimeout) {
			clearTimeout(rateLimitWarningTimeout)
			rateLimitWarningTimeout = null
			rateLimitWarningShown = false
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
			rateLimitWarningShown = true
			if (rateLimitWarningTimeout) {
				clearTimeout(rateLimitWarningTimeout)
			}
			rateLimitWarningTimeout = setTimeout(() => {
				rateLimitWarningShown = false
			}, 5000)
		}

		// Handle authentication errors
		if (error.response?.status === 401) {
			toast.error('Authentication required', {
				description: 'Please log in to continue.',
			})
		}

		// Handle server errors
		if (error.response?.status >= 500) {
			toast.error('Server error', {
				description: 'Something went wrong on our end. Please try again later.',
			})
		}

		return Promise.reject(error)
	},
)

// Add request interceptor to handle slow requests
apiClient.interceptors.request.use((config) => {
	// Add request timestamp for timing
	config.metadata = { startTime: Date.now() }
	return config
})

// Add response timing
apiClient.interceptors.response.use(
	(response) => {
		const endTime = Date.now()
		const startTime = response.config.metadata?.startTime || endTime
		const duration = endTime - startTime

		// Warn user if request took longer than 3 seconds (likely being slowed down)
		if (duration > 3000 && !rateLimitWarningShown) {
			toast.warning('Slow Response', {
				description: 'You may be making requests too quickly. Consider slowing down.',
				duration: 3000,
			})
		}

		return response
	},
	(error) => {
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

export default apiClient
