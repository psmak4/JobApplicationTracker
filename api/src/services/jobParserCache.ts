import { LRUCache } from 'lru-cache'
import type { ParsedJobData } from './parsers/types'

interface CacheEntry {
	parsedData: ParsedJobData
	timestamp: number
	url: string
}

// Configure LRU cache with 24-hour TTL and max 1000 entries
const cache = new LRUCache<string, CacheEntry>({
	max: 1000,
	ttl: 1000 * 60 * 60 * 24, // 24 hours
	updateAgeOnGet: true,
	allowStale: false,
})

/**
 * Normalize URL for consistent cache keys
 * Preserves job ID parameters while removing tracking parameters
 */
export function normalizeUrl(url: string): string {
	try {
		const parsed = new URL(url)

		// Convert to lowercase for consistency
		const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '')
		const pathname = parsed.pathname.toLowerCase()

		// Define which query params to keep (job IDs and essential params)
		const essentialParams = [
			// LinkedIn
			'currentJobId',
			// Indeed
			'jk',
			// Greenhouse
			'gh_jid',
			// Lever
			'lever-source',
			// Workday
			'job',
			// Generic job ID patterns
			'jobid',
			'job_id',
			'id',
			'position',
		]

		// Filter query params - keep only essential ones
		const searchParams = new URLSearchParams()
		for (const [key, value] of parsed.searchParams) {
			const lowerKey = key.toLowerCase()
			if (essentialParams.includes(lowerKey) || essentialParams.some((param) => lowerKey.includes(param))) {
				searchParams.set(key, value)
			}
		}

		// Rebuild URL
		let normalized = `${hostname}${pathname}`
		const queryString = searchParams.toString()
		if (queryString) {
			normalized += `?${queryString}`
		}

		return normalized
	} catch {
		// If URL parsing fails, return original (shouldn't happen with validation)
		return url.toLowerCase()
	}
}

/**
 * Get cached job data if available and not expired
 */
export function getCachedJob(url: string): { data: ParsedJobData; fromCache: true } | null {
	const normalizedUrl = normalizeUrl(url)
	const entry = cache.get(normalizedUrl)

	if (entry) {
		return { data: entry.parsedData, fromCache: true }
	}

	return null
}

/**
 * Store parsed job data in cache
 */
export function setCachedJob(url: string, data: ParsedJobData): void {
	const normalizedUrl = normalizeUrl(url)
	cache.set(normalizedUrl, {
		parsedData: data,
		timestamp: Date.now(),
		url: normalizedUrl,
	})
}

/**
 * Clear cached entry for a specific URL (used for re-parsing)
 */
export function clearCachedJob(url: string): void {
	const normalizedUrl = normalizeUrl(url)
	cache.delete(normalizedUrl)
}

/**
 * Get cache statistics for monitoring
 */
interface CacheStats {
	size: number
	maxSize: number
}

export function getCacheStats(): CacheStats {
	return {
		size: cache.size,
		maxSize: cache.max,
	}
}
