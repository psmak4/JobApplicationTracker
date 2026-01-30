import { Readability } from '@mozilla/readability'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { lookup } from 'dns/promises'
import { JSDOM } from 'jsdom'
import sanitizeHtml from 'sanitize-html'
import TurndownService from 'turndown'
import urlParse from 'url-parse'
import { GreenhouseParser, LeverParser, WorkdayParser } from './parsers/ats'
import { GenericParser } from './parsers/generic'
import { GlassdoorParser } from './parsers/glassdoor'
import { IndeedParser } from './parsers/indeed'
import { LinkedInParser } from './parsers/linkedin'
import { clearCachedJob, getCachedJob, setCachedJob } from './jobParserCache'
import type { JobParserStrategy, ParsedJobData } from './parsers/types'

interface ParserResult {
	success: boolean
	data?: ParsedJobData
	error?: string
	rawText?: string
	debugInfo?: {
		domain: string
		parserUsed: string
		processingTime: number
	}
}

interface ValidationResult {
	valid: boolean
	reason?: string
}

// Supported domains for specialized parsing
const ALLOWED_DOMAINS = [
	'linkedin.com',
	'indeed.com',
	'glassdoor.com',
	'greenhouse.io',
	'lever.co',
	'myworkdayjobs.com',
	'ashbyhq.com',
	'jobs.lever.co',
	'boards.greenhouse.io',
]

// User agents to rotate
const USER_AGENTS = [
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/115.0',
	'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
]

class JobParser {
	private strategies: JobParserStrategy[]
	private genericParser: GenericParser

	constructor() {
		this.strategies = [
			new LinkedInParser(),
			new IndeedParser(),
			new GlassdoorParser(),
			new GreenhouseParser(),
			new LeverParser(),
			new WorkdayParser(),
		]
		this.genericParser = new GenericParser()
	}

	/**
	 * Main parsing method using Strategy pattern with caching support
	 * @param url - Job posting URL to parse
	 * @param skipCache - If true, bypass cache and re-parse (for refreshing data)
	 */
	async parse(url: string, skipCache = false): Promise<ParserResult> {
		const startTime = Date.now()

		try {
			// Check cache first (unless skipCache is true)
			if (!skipCache) {
				const cached = getCachedJob(url)
				if (cached) {
					const processingTime = Date.now() - startTime
					return {
						success: true,
						data: cached.data,
						debugInfo: {
							domain: urlParse(url).hostname.replace(/^www\./, ''),
							parserUsed: 'cache',
							processingTime,
						},
					}
				}
			}

			// Validate URL
			const validation = await this.validateUrl(url)
			if (!validation.valid) {
				return {
					success: false,
					error: validation.reason || 'Invalid URL',
				}
			}

			// Fetch content
			let html: string
			try {
				html = await this.fetchContent(url)
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Failed to fetch job posting'
				return {
					success: false,
					error: errorMessage,
				}
			}

			// Sanitize HTML
			const cleanHtml = this.sanitizeHTML(html)

			// Parse HTML
			const $ = cheerio.load(cleanHtml)

			// Extract readable content
			const { text: readableText, markdown } = this.extractReadableContent(cleanHtml, url)

			// Find appropriate strategy
			const strategy = this.strategies.find((s) => s.canParse(url)) || this.genericParser
			const parserUsed = strategy.name

			// Execute strategy
			let parsedData = strategy.parse($, readableText, url)

			// If specific strategy missed fields, try generic parser to fill gaps
			if (strategy !== this.genericParser) {
				const genericData = this.genericParser.parse($, readableText, url)
				parsedData = {
					...genericData, // Generic attempts to find everything
					...parsedData, // Specific overrides generic if successful
				}
			}

			// Track which fields were successfully extracted
			const extractedFields: string[] = []
			if (parsedData.company) extractedFields.push('company')
			if (parsedData.jobTitle) extractedFields.push('jobTitle')
			if (parsedData.location) extractedFields.push('location')
			if (parsedData.salary) extractedFields.push('salary')
			if (parsedData.workType) extractedFields.push('workType')

			// Calculate confidence
			const confidence = this.calculateConfidence(parsedData, extractedFields)

			// Get domain for source
			const hostname = urlParse(url).hostname.replace(/^www\./, '')

			const processingTime = Date.now() - startTime

			const result: ParsedJobData = {
				...parsedData,
				description: markdown.slice(0, 2000), // First 2000 chars
				confidence,
				source: hostname,
				extractedFields,
			}

			// Cache the result (unless skipCache is true)
			if (!skipCache) {
				setCachedJob(url, result)
			}

			return {
				success: true,
				data: result,
				rawText: readableText.slice(0, 1000),
				debugInfo: {
					domain: hostname,
					parserUsed,
					processingTime,
				},
			}
		} catch (error) {
			console.error('Job parser error:', error)
			const errorMessage = error instanceof Error ? error.message : 'Failed to parse job posting'
			return {
				success: false,
				error: errorMessage,
				debugInfo: {
					domain: urlParse(url).hostname,
					parserUsed: 'error',
					processingTime: Date.now() - startTime,
				},
			}
		}
	}

	/**
	 * Clear cache for a specific URL (useful for forcing re-parse)
	 */
	clearCache(url: string): void {
		clearCachedJob(url)
	}

	/**
	 * Check if an IP address is in a private range
	 */
	private isPrivateIP(ip: string): boolean {
		// Check for localhost
		if (ip === '127.0.0.1' || ip === '::1' || ip === '0:0:0:0:0:0:0:1') {
			return true
		}

		// IPv4 private ranges
		const parts = ip.split('.').map(Number)
		if (parts.length === 4) {
			// 10.0.0.0/8
			if (parts[0] === 10) return true
			// 172.16.0.0/12
			if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true
			// 192.168.0.0/16
			if (parts[0] === 192 && parts[1] === 168) return true
			// 169.254.0.0/16 (link-local)
			if (parts[0] === 169 && parts[1] === 254) return true
			// 127.0.0.0/8 (loopback)
			if (parts[0] === 127) return true
		}

		// IPv6 private ranges (simplified check)
		if (ip.includes(':')) {
			// fc00::/7 (unique local)
			if (ip.toLowerCase().startsWith('fc') || ip.toLowerCase().startsWith('fd')) return true
			// fe80::/10 (link-local)
			if (ip.toLowerCase().startsWith('fe8')) return true
		}

		return false
	}

	/**
	 * Validate URL safety including DNS resolution check
	 */
	private async validateUrl(url: string): Promise<ValidationResult> {
		try {
			const parsed = urlParse(url)

			// Validate protocol
			if (!['http:', 'https:'].includes(parsed.protocol)) {
				return { valid: false, reason: 'Invalid protocol. Use http or https.' }
			}

			const hostname = parsed.hostname.toLowerCase()

			// Block localhost variants
			if (
				hostname === 'localhost' ||
				hostname === '127.0.0.1' ||
				hostname === '[::1]' ||
				hostname === '[::]' ||
				hostname.endsWith('.local') ||
				hostname.endsWith('.localhost')
			) {
				return { valid: false, reason: 'Invalid hostname (private network).' }
			}

			// Check if hostname is an IP address directly
			if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
				if (this.isPrivateIP(hostname)) {
					return { valid: false, reason: 'Invalid hostname (private IP address).' }
				}
			}

			// DNS resolution check to prevent DNS rebinding attacks
			try {
				const addresses = await lookup(hostname, { all: true })
				for (const addr of addresses) {
					if (this.isPrivateIP(addr.address)) {
						return { valid: false, reason: 'Invalid hostname (resolves to private network).' }
					}
				}
			} catch (dnsError) {
				// DNS lookup failed - hostname might not exist
				// We'll allow this to proceed as the HTTP request will fail anyway
				console.warn(`DNS lookup failed for ${hostname}:`, dnsError)
			}

			return { valid: true }
		} catch {
			return { valid: false, reason: 'Malformed URL' }
		}
	}

	/**
	 * Fetch content with rotation and anti-bot measures
	 */
	private async fetchContent(url: string): Promise<string> {
		const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]

		const response = await axios.get(url, {
			headers: {
				'User-Agent': userAgent,
				Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
				'Accept-Language': 'en-US,en;q=0.5',
				'Cache-Control': 'no-cache',
				Pragma: 'no-cache',
			},
			timeout: 10000,
			maxRedirects: 5,
			validateStatus: (status) => status < 400,
		})

		return response.data
	}

	/**
	 * Sanitize HTML to prevent XSS and reduce size
	 */
	private sanitizeHTML(html: string): string {
		return sanitizeHtml(html, {
			allowedTags: sanitizeHtml.defaults.allowedTags.concat([
				'img',
				'h1',
				'h2',
				'h3',
				'article',
				'section',
				'main',
			]),
			allowedAttributes: {
				'*': ['class', 'id', 'itemprop', 'data-*'],
				a: ['href'],
				img: ['src', 'alt'],
				meta: ['property', 'content', 'name'],
			},
			allowVulnerableTags: true, // Need this for some messy scraped HTML
		})
	}

	/**
	 * Extract readable content and markdown
	 */
	private extractReadableContent(html: string, url: string): { text: string; markdown: string } {
		const doc = new JSDOM(html, { url })
		const reader = new Readability(doc.window.document)
		const article = reader.parse()

		if (!article) {
			// Fallback: simple text extraction
			const $ = cheerio.load(html)
			return {
				text: $('body').text().replace(/\s+/g, ' ').trim(),
				markdown: '',
			}
		}

		const turndownService = new TurndownService()
		const content = article.content || ''
		const markdown = turndownService.turndown(content)

		return {
			text: (article.textContent || '').replace(/\s+/g, ' ').trim(),
			markdown,
		}
	}

	/**
	 * Calculate confidence score based on extracted data quality
	 */
	private calculateConfidence(data: Partial<ParsedJobData>, extractedFields: string[]): 'high' | 'medium' | 'low' {
		let score = 0
		const weights = {
			company: 30,
			jobTitle: 40,
			location: 15,
			salary: 10,
			workType: 5,
		}

		for (const [field, weight] of Object.entries(weights)) {
			if (data[field as keyof typeof weights]) {
				score += weight
			}
		}

		// Bonus points for data quality
		if (data.company && data.company.length > 2) score += 5
		if (data.jobTitle && data.jobTitle.length > 5) score += 5
		if (extractedFields.length >= 4) score += 10

		if (score >= 75) return 'high'
		if (score >= 45) return 'medium'
		return 'low'
	}

	/**
	 * Get list of supported domains
	 */
	getSupportedDomains(): string[] {
		return [...ALLOWED_DOMAINS]
	}

	/**
	 * Check if a URL is supported without parsing
	 */
	async isSupported(url: string): Promise<boolean> {
		const validation = await this.validateUrl(url)
		return validation.valid
	}
}

export const jobParser = new JobParser()
export type { ParsedJobData, ParserResult }
