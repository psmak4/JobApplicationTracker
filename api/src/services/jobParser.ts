import { Readability } from '@mozilla/readability'
import axios from 'axios'
import * as cheerio from 'cheerio'
import he from 'he'
import { JSDOM } from 'jsdom'
import sanitizeHtml from 'sanitize-html'
import TurndownService from 'turndown'
import urlParse from 'url-parse'

interface ParsedJobData {
	company?: string
	jobTitle?: string
	location?: string
	salary?: string
	workType?: 'Remote' | 'Hybrid' | 'On-site'
	description?: string
	confidence: 'high' | 'medium' | 'low'
	source: string
	extractedFields: string[] // Track which fields were successfully extracted
}

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

// Comprehensive whitelist of job board domains
const ALLOWED_DOMAINS = [
	// Major job boards
	'linkedin.com',
	'indeed.com',
	'glassdoor.com',
	'monster.com',
	'ziprecruiter.com',
	'simplyhired.com',
	'careerbuilder.com',
	'dice.com',
	'stackoverflow.com',

	// Tech company career pages
	'careers.google.com',
	'jobs.apple.com',
	'amazon.jobs',
	'careers.microsoft.com',
	'facebook.com/careers',
	'meta.com/careers',
	'tesla.com/careers',
	'netflix.com/jobs',

	// ATS platforms
	'greenhouse.io',
	'lever.co',
	'workday.com',
	'successfactors.com',
	'icims.com',
	'taleo.net',
	'breezy.hr',
	'jobvite.com',
	'smartrecruiters.com',
	'bamboohr.com',
	'workable.com',
	'recruitee.com',
	'ashbyhq.com',
	'myworkdayjobs.com',
	'ultipro.com',
	'paylocity.com',
	'paycom.com',
	'namely.com',

	// Startup/tech job boards
	'angellist.com',
	'wellfound.com',
	'ycombinator.com',
	'techjobs.io',
	'remoteok.io',
	'weworkremotely.com',
	'remoteco.com',
	'flexjobs.com',
	'hired.com',
	'triplebyte.com',
]

// Patterns to identify job-related URLs
const JOB_URL_PATTERNS = [
	/\/jobs?\//i,
	/\/careers?\//i,
	/\/positions?\//i,
	/\/opportunities/i,
	/\/apply/i,
	/\/job-details/i,
	/\/job-listing/i,
	/\/vacancy/i,
	/\/vacancies/i,
	/\/opening/i,
	/\/hiring/i,
	/\/employment/i,
	/\/work-with-us/i,
	/\/join-us/i,
	/\/join-our-team/i,
	/viewjob/i,
	/posting/i,
	/jobs\.lever\.co/i,
]

class JobParser {
	private userAgent =
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
	private turndownService: TurndownService

	constructor() {
		this.turndownService = new TurndownService({
			headingStyle: 'atx',
			codeBlockStyle: 'fenced',
		})
	}

	/**
	 * Validate if URL is from an allowed domain and looks like a job posting
	 */
	private validateUrl(url: string): { valid: boolean; reason?: string } {
		try {
			const parsed = urlParse(url)

			// Check protocol
			if (!['http:', 'https:'].includes(parsed.protocol)) {
				return { valid: false, reason: 'Only HTTP and HTTPS protocols are supported' }
			}

			const hostname = parsed.hostname.toLowerCase()
			const cleanHostname = hostname.replace(/^www\./, '')

			// Check if domain is whitelisted
			const isAllowedDomain = ALLOWED_DOMAINS.some((domain) => {
				return cleanHostname === domain || cleanHostname.endsWith('.' + domain)
			})

			if (!isAllowedDomain) {
				return {
					valid: false,
					reason: `Domain '${cleanHostname}' is not in the allowed list of job boards. Supported sites include: LinkedIn, Indeed, Glassdoor, and company career pages using Greenhouse, Lever, or Workday.`,
				}
			}

			// Check if URL path looks like a job posting
			const fullUrl = url.toLowerCase()
			const looksLikeJob = JOB_URL_PATTERNS.some((pattern) => pattern.test(fullUrl))

			if (!looksLikeJob) {
				return {
					valid: false,
					reason: "URL does not appear to be a job posting. Make sure you're using the direct link to a specific job, not a search results page.",
				}
			}

			return { valid: true }
		} catch (error) {
			return { valid: false, reason: 'Invalid URL format' }
		}
	}

	/**
	 * Fetch HTML content from URL with retries and better error handling
	 * Includes SSRF protection by validating final URL after redirects
	 */
	private async fetchContent(url: string, retries = 2): Promise<string> {
		for (let attempt = 1; attempt <= retries + 1; attempt++) {
			try {
				const response = await axios.get(url, {
					headers: {
						'User-Agent': this.userAgent,
						Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
						'Accept-Language': 'en-US,en;q=0.9',
						'Accept-Encoding': 'gzip, deflate, br',
						'Cache-Control': 'no-cache',
						Pragma: 'no-cache',
					},
					timeout: 15000,
					maxRedirects: 5,
					maxContentLength: 10 * 1024 * 1024, // 10MB max
					validateStatus: (status) => status < 500, // Don't throw on 4xx
				})

				// SSRF Protection: Validate final URL after redirects
				const finalUrl = response.request?.res?.responseUrl || response.config?.url
				if (finalUrl && finalUrl !== url) {
					const finalValidation = this.validateUrl(finalUrl)
					if (!finalValidation.valid) {
						throw new Error('Redirect to non-allowed domain detected. Request blocked for security.')
					}
				}

				if (response.status === 403) {
					throw new Error('Access denied - the website may be blocking automated requests')
				}

				if (response.status === 404) {
					throw new Error('Job posting not found - the link may be expired or invalid')
				}

				if (response.status >= 400) {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`)
				}

				return response.data
			} catch (error: any) {
				if (attempt === retries + 1) {
					// Last attempt failed
					if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
						throw new Error('Request timeout - the page took too long to load. Please try again.')
					}
					if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
						throw new Error('Could not connect to the website. Please check the URL and try again.')
					}
					throw error
				}
				// Wait before retry with exponential backoff
				await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
			}
		}
		throw new Error('Failed to fetch content after retries')
	}

	/**
	 * Clean and sanitize HTML
	 */
	private sanitizeHTML(html: string): string {
		return sanitizeHtml(html, {
			allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']),
			allowedAttributes: {
				...sanitizeHtml.defaults.allowedAttributes,
				'*': ['class', 'id', 'data-*', 'itemprop', 'itemtype'],
			},
		})
	}

	/**
	 * Extract text content using multiple methods
	 */
	private extractReadableContent(html: string, url: string): { text: string; markdown: string } {
		try {
			// Try Readability first
			const dom = new JSDOM(html, { url })
			const reader = new Readability(dom.window.document)
			const article = reader.parse()

			if (article && article.content) {
				const markdown = this.turndownService.turndown(article.content)
				return {
					text: article.textContent || '',
					markdown: markdown,
				}
			}
		} catch (error) {
			console.warn('Readability parsing failed, falling back to cheerio')
		}

		// Fallback to cheerio
		const $ = cheerio.load(html)

		// Remove unwanted elements
		$('script, style, nav, header, footer, iframe, noscript').remove()

		const text = $('body').text()
		const cleanText = text.replace(/\s+/g, ' ').trim()

		return {
			text: cleanText,
			markdown: cleanText,
		}
	}

	/**
	 * Detect domain-specific parser strategy
	 */
	private getParserStrategy(url: string): string {
		const hostname = urlParse(url).hostname.toLowerCase()

		if (hostname.includes('linkedin.com')) return 'linkedin'
		if (hostname.includes('indeed.com')) return 'indeed'
		if (hostname.includes('glassdoor.com')) return 'glassdoor'
		if (hostname.includes('greenhouse.io')) return 'greenhouse'
		if (hostname.includes('lever.co')) return 'lever'
		if (hostname.includes('workday.com') || hostname.includes('myworkdayjobs.com')) return 'workday'
		if (hostname.includes('ashbyhq.com')) return 'ashby'
		if (hostname.includes('smartrecruiters.com')) return 'smartrecruiters'
		if (hostname.includes('jobvite.com')) return 'jobvite'

		return 'generic'
	}

	/**
	 * LinkedIn-specific parsing
	 */
	private parseLinkedIn($: cheerio.CheerioAPI): Partial<ParsedJobData> {
		const data: Partial<ParsedJobData> = {}

		// Job title
		data.jobTitle =
			$('.top-card-layout__title').first().text().trim() ||
			$('h1.t-24').first().text().trim() ||
			$('[class*="job-details-jobs-unified-top-card__job-title"]').first().text().trim()

		// Company
		data.company =
			$('.topcard__org-name-link').first().text().trim() ||
			$('.top-card-layout__card a.app-aware-link').first().text().trim() ||
			$('[class*="job-details-jobs-unified-top-card__company-name"]').first().text().trim()

		// Location
		data.location =
			$('.topcard__flavor--bullet').first().text().trim() ||
			$('.top-card-layout__card .topcard__flavor--bullet').first().text().trim() ||
			$('[class*="job-details-jobs-unified-top-card__bullet"]').first().text().trim()

		// Work type
		const description = $('.show-more-less-html__markup').text().toLowerCase()
		if (description.includes('remote')) data.workType = 'Remote'
		else if (description.includes('hybrid')) data.workType = 'Hybrid'
		else if (description.includes('on-site') || description.includes('onsite')) data.workType = 'On-site'

		return data
	}

	/**
	 * Indeed-specific parsing
	 */
	private parseIndeed($: cheerio.CheerioAPI): Partial<ParsedJobData> {
		const data: Partial<ParsedJobData> = {}

		// Job title
		data.jobTitle =
			$('h1.jobsearch-JobInfoHeader-title').first().text().trim() ||
			$('[class*="jobsearch-JobInfoHeader-title"]').first().text().trim() ||
			$('h1').first().text().trim()

		// Company
		data.company =
			$('[data-company-name="true"]').first().text().trim() ||
			$('[class*="jobsearch-InlineCompanyRating"] a').first().text().trim() ||
			$('[class*="jobsearch-CompanyInfoContainer"] a').first().text().trim()

		// Location
		data.location =
			$('[data-testid="job-location"]').first().text().trim() ||
			$('[class*="jobsearch-JobInfoHeader-subtitle"] div').eq(1).text().trim()

		// Salary
		const salaryElement =
			$('#salaryInfoAndJobType').text() ||
			$('[class*="salary-snippet"]').text() ||
			$('[id*="salaryGuide"]').text()

		if (salaryElement) {
			data.salary = salaryElement.trim()
		}

		return data
	}

	/**
	 * Greenhouse-specific parsing
	 */
	private parseGreenhouse($: cheerio.CheerioAPI): Partial<ParsedJobData> {
		const data: Partial<ParsedJobData> = {}

		data.jobTitle = $('.app-title').first().text().trim() || $('h1.app-title').first().text().trim()

		data.company = $('.company-name').first().text().trim() || $('[class*="company"]').first().text().trim()

		data.location = $('.location').first().text().trim() || $('[class*="location"]').first().text().trim()

		return data
	}

	/**
	 * Lever-specific parsing
	 */
	private parseLever($: cheerio.CheerioAPI): Partial<ParsedJobData> {
		const data: Partial<ParsedJobData> = {}

		data.jobTitle =
			$('.posting-headline h2').first().text().trim() || $('h2[class*="posting-title"]').first().text().trim()

		data.company =
			$('.main-header-text-logo').first().text().trim() || $('[class*="company"]').first().text().trim()

		const categories = $('.posting-categories .posting-category')
		categories.each((_, elem) => {
			const text = $(elem).text().toLowerCase()
			if (text.includes('location')) {
				data.location = $(elem).find('.posting-category-value').text().trim()
			}
			if (text.includes('remote')) {
				data.workType = 'Remote'
			}
		})

		return data
	}

	/**
	 * Workday-specific parsing
	 */
	private parseWorkday($: cheerio.CheerioAPI): Partial<ParsedJobData> {
		const data: Partial<ParsedJobData> = {}

		data.jobTitle =
			$('h2[data-automation-id="jobPostingHeader"]').first().text().trim() ||
			$('h1[class*="title"]').first().text().trim()

		data.location =
			$('[data-automation-id="locations"]').first().text().trim() ||
			$('dd[class*="location"]').first().text().trim()

		// Workday doesn't always show company in the posting (it's in the URL/header)
		const companyMatch = $('.css-12hm4pa').first().text().trim()
		if (companyMatch) data.company = companyMatch

		return data
	}

	/**
	 * Glassdoor-specific parsing
	 */
	private parseGlassdoor($: cheerio.CheerioAPI): Partial<ParsedJobData> {
		const data: Partial<ParsedJobData> = {}

		// Job title - Glassdoor uses various selectors
		data.jobTitle =
			$('[data-test="job-title"]').first().text().trim() ||
			$('h1[class*="JobTitle"]').first().text().trim() ||
			$('.job-title').first().text().trim() ||
			$('h1').first().text().trim()

		// Company name
		data.company =
			$('[data-test="employer-name"]').first().text().trim() ||
			$('[class*="EmployerName"]').first().text().trim() ||
			$('.employer-name').first().text().trim()

		// Location
		data.location =
			$('[data-test="job-location"]').first().text().trim() ||
			$('[class*="JobLocation"]').first().text().trim() ||
			$('.location').first().text().trim()

		// Salary - Glassdoor often shows salary estimates
		const salaryText =
			$('[data-test="salary-estimate"]').first().text().trim() ||
			$('[class*="SalaryEstimate"]').first().text().trim() ||
			$('.salary-estimate').first().text().trim()

		if (salaryText) {
			data.salary = salaryText
		}

		// Work type detection from job details
		const jobDetails = $('[class*="JobDetails"]').text().toLowerCase() || $('body').text().toLowerCase()
		if (jobDetails.includes('remote')) data.workType = 'Remote'
		else if (jobDetails.includes('hybrid')) data.workType = 'Hybrid'
		else if (jobDetails.includes('on-site') || jobDetails.includes('onsite')) data.workType = 'On-site'

		return data
	}

	/**
	 * Generic parsing with multiple strategies
	 */
	private parseGeneric($: cheerio.CheerioAPI, text: string, url: string): Partial<ParsedJobData> {
		return {
			company: this.parseCompany($, text, url),
			jobTitle: this.parseJobTitle($),
			location: this.parseLocation($, text),
			salary: this.parseSalary($, text),
			workType: this.parseWorkType($, text),
		}
	}

	/**
	 * Parse company name with improved extraction
	 */
	private parseCompany($: cheerio.CheerioAPI, text: string, url: string): string | undefined {
		// Try structured data (Schema.org)
		const structuredData = $('script[type="application/ld+json"]')
		let companyFromSchema: string | undefined
		structuredData.each((_, elem) => {
			try {
				const data = JSON.parse($(elem).html() || '{}')
				if (data['@type'] === 'JobPosting' && data.hiringOrganization?.name) {
					companyFromSchema = data.hiringOrganization.name
					return false // break
				}
			} catch {}
		})

		if (companyFromSchema) return companyFromSchema

		// Try meta tags
		const metaTags = [
			'meta[property="og:site_name"]',
			'meta[name="company"]',
			'meta[property="hiring:company"]',
			'meta[name="application-name"]',
			'meta[property="og:title"]',
		]

		for (const selector of metaTags) {
			const content = $(selector).attr('content')
			if (content && content.length > 1 && content.length < 100) {
				// Clean up common patterns
				const cleaned = content
					.replace(/\s*[-|]\s*.*/, '')
					.replace(/\s*careers.*$/i, '')
					.replace(/\s*jobs.*$/i, '')
					.trim()
				if (cleaned.length > 1) return cleaned
			}
		}

		// Try common selectors with priority
		const companySelectors = [
			{ selector: '[data-company]', attr: 'data-company' },
			{ selector: '[data-company-name]', attr: 'data-company-name' },
			{ selector: '.company-name', attr: null },
			{ selector: '.employer-name', attr: null },
			{ selector: '.company', attr: null },
			{ selector: '[itemprop="hiringOrganization"] [itemprop="name"]', attr: null },
			{ selector: '[class*="company"]', attr: null },
			{ selector: '[class*="employer"]', attr: null },
			{ selector: 'header a[href*="company"]', attr: null },
		]

		for (const { selector, attr } of companySelectors) {
			const elem = $(selector).first()
			const company = attr ? elem.attr(attr) : elem.text()

			if (company) {
				const cleaned = he.decode(company).trim()
				if (cleaned.length > 1 && cleaned.length < 100 && !cleaned.includes('|')) {
					return cleaned
				}
			}
		}

		// Extract from URL subdomain
		const hostname = urlParse(url).hostname
		if (hostname.startsWith('careers.') || hostname.startsWith('jobs.')) {
			const parts = hostname.split('.')
			if (parts.length >= 2) {
				const company = parts[parts.length - 2]
				return company.charAt(0).toUpperCase() + company.slice(1)
			}
		}

		// Pattern matching in text (improved)
		const companyPatterns = [
			/(?:at|@|with|for|join)\s+([A-Z][A-Za-z0-9\s&,.'"-]{1,49})(?:\s+(?:is|as|in|for|to)|[,.]|\s*$)/,
			/([A-Z][A-Za-z0-9\s&,.'"-]{2,49})\s+is\s+(?:hiring|looking|seeking|searching)/i,
			/(?:About|Join)\s+([A-Z][A-Za-z0-9\s&,.'"-]{2,49})\s*:/,
		]

		for (const pattern of companyPatterns) {
			const match = text.match(pattern)
			if (match && match[1]) {
				const company = he.decode(match[1]).trim()
				// Filter out common false positives
				const invalidCompanies = ['the', 'our', 'this', 'your', 'about', 'careers', 'jobs', 'apply']
				if (!invalidCompanies.includes(company.toLowerCase()) && company.length >= 2) {
					return company
				}
			}
		}

		return undefined
	}

	/**
	 * Parse job title with improved extraction
	 */
	private parseJobTitle($: cheerio.CheerioAPI): string | undefined {
		// Try structured data
		const structuredData = $('script[type="application/ld+json"]')
		let titleFromSchema: string | undefined

		structuredData.each((_, elem) => {
			try {
				const data = JSON.parse($(elem).html() || '{}')
				if (data['@type'] === 'JobPosting' && data.title) {
					titleFromSchema = data.title
					return false // break
				}
			} catch {}
		})

		if (titleFromSchema) return he.decode(titleFromSchema).trim()

		// Try meta tags
		const metaTags = [
			'meta[property="og:title"]',
			'meta[name="title"]',
			'meta[property="twitter:title"]',
			'meta[name="job-title"]',
		]

		for (const selector of metaTags) {
			const content = $(selector).attr('content')
			if (content) {
				// Clean up common patterns
				const cleaned = content
					.replace(/\s*[-|]\s*.*/, '')
					.replace(/\s*at\s+.*$/i, '')
					.trim()
				if (cleaned.length > 3 && cleaned.length < 200) {
					return he.decode(cleaned)
				}
			}
		}

		// Try common selectors with priority
		const titleSelectors = [
			'h1.job-title',
			'h1[class*="job-title"]',
			'h1[class*="posting-title"]',
			'h1[class*="title"]',
			'[data-job-title]',
			'[itemprop="title"]',
			'.job-header h1',
			'.posting-headline h2',
			'article h1',
			'main h1',
			'h1',
		]

		for (const selector of titleSelectors) {
			const title = $(selector).first().text().trim()
			if (title && title.length > 3 && title.length < 200) {
				// Filter out common false positives
				if (!title.toLowerCase().includes('career') && !title.toLowerCase().includes('job board')) {
					return he.decode(title)
				}
			}
		}

		return undefined
	}

	/**
	 * Parse location with improved extraction
	 */
	private parseLocation($: cheerio.CheerioAPI, text: string): string | undefined {
		// Try structured data
		const structuredData = $('script[type="application/ld+json"]')
		let locationFromSchema: string | undefined
		structuredData.each((_, elem) => {
			try {
				const data = JSON.parse($(elem).html() || '{}')
				if (data['@type'] === 'JobPosting' && data.jobLocation) {
					const location = data.jobLocation
					if (location.address) {
						const addr = location.address
						locationFromSchema = [addr.addressLocality, addr.addressRegion].filter(Boolean).join(', ')
						return false // break
					}
				}
			} catch {}
		})

		if (locationFromSchema) return locationFromSchema

		// Try meta tags
		const locationMeta = ['meta[property="og:location"]', 'meta[name="location"]', 'meta[property="job:location"]']

		for (const selector of locationMeta) {
			const content = $(selector).attr('content')
			if (content && content.length < 100) {
				return he.decode(content).trim()
			}
		}

		// Try common selectors
		const locationSelectors = [
			'[data-location]',
			'.location',
			'.job-location',
			'[itemprop="jobLocation"]',
			'[itemprop="addressLocality"]',
			'[class*="location"]',
			'[class*="address"]',
		]

		for (const selector of locationSelectors) {
			const location = $(selector).first().text().trim()
			if (location && location.length > 2 && location.length < 100) {
				return he.decode(location)
			}
		}

		// Pattern matching with improved regex
		const locationPatterns = [
			/Location[:\s]+([A-Z][A-Za-z\s,.-]+(?:,\s*[A-Z]{2})?(?:,\s*[A-Z][a-z]+)?)/i,
			/(?:Based in|Located in)[:\s]+([A-Z][A-Za-z\s,.-]+)/i,
			/([A-Z][a-z]+,\s*[A-Z]{2}(?:,\s*(?:USA|United States))?)/,
			/([A-Z][a-z]+,\s*[A-Z][a-z]+(?:,\s*[A-Z]{2})?)/,
		]

		for (const pattern of locationPatterns) {
			const match = text.match(pattern)
			if (match && match[1]) {
				const location = he.decode(match[1]).trim()
				if (location.length > 2 && location.length < 100) {
					return location
				}
			}
		}

		return undefined
	}

	/**
	 * Parse salary with improved extraction
	 */
	private parseSalary($: cheerio.CheerioAPI, text: string): string | undefined {
		// Try structured data
		const structuredData = $('script[type="application/ld+json"]')
		let salaryFromSchema: string | undefined
		structuredData.each((_, elem) => {
			try {
				const data = JSON.parse($(elem).html() || '{}')
				if (data['@type'] === 'JobPosting' && data.baseSalary) {
					const salary = data.baseSalary
					// Handle both direct value and nested value object
					if (salary.value != null && salary.value.value != null) {
						salaryFromSchema = `$${salary.value.value} ${salary.value.unitText || 'per year'}`
						return false // break
					} else if (typeof salary.value === 'number' || typeof salary.value === 'string') {
						salaryFromSchema = `$${salary.value} ${salary.unitText || 'per year'}`
						return false // break
					}
				}
			} catch {}
		})

		if (salaryFromSchema) return salaryFromSchema

		// Try common selectors
		const salarySelectors = [
			'[data-salary]',
			'.salary',
			'.compensation',
			'.pay-range',
			'[itemprop="baseSalary"]',
			'.salary-range',
			'[class*="salary"]',
			'[class*="compensation"]',
			'[class*="pay"]',
		]

		for (const selector of salarySelectors) {
			const salary = $(selector).first().text().trim()
			if (salary && salary.match(/\$|usd|k/i)) {
				return he.decode(salary)
			}
		}

		// Pattern matching with improved regex
		const salaryPatterns = [
			/(?:Salary|Pay|Compensation)[:\s]+(\$[\d,]+(?:\.\d{2})?\s*(?:-|to)\s*\$[\d,]+(?:\.\d{2})?(?:\s*(?:per|\/)\s*(?:year|yr|hour|hr|annum))?)/i,
			/(\$[\d,]+(?:\.\d{2})?\s*(?:-|to)\s*\$[\d,]+(?:\.\d{2})?(?:\s*(?:per|\/)\s*(?:year|yr|hour|hr|annum))?)/,
			/([\d,]+k\s*-\s*[\d,]+k(?:\s*(?:per|\/)\s*year)?)/i,
			/(\$[\d,]+(?:\+)?(?:\s*(?:per|\/)\s*(?:year|yr|hour|hr))?)/,
		]

		for (const pattern of salaryPatterns) {
			const match = text.match(pattern)
			if (match) {
				const salary = he.decode(match[1] || match[0]).trim()
				// Validate it looks like a reasonable salary
				if (salary.length < 50) {
					return salary
				}
			}
		}

		return undefined
	}

	/**
	 * Determine work type with improved detection
	 */
	private parseWorkType($: cheerio.CheerioAPI, text: string): 'Remote' | 'Hybrid' | 'On-site' | undefined {
		const fullText = (text + ' ' + $('body').text()).toLowerCase()

		// Check for explicit indicators with priority
		const remotePatterns = [
			/\b(fully\s+)?remote\b/,
			/\bwork\s+from\s+home\b/,
			/\bwfh\b/,
			/\b100%\s+remote\b/,
			/\bremote-first\b/,
			/\banywhere\b.*\bremote\b/,
		]

		const hybridPatterns = [
			/\bhybrid\b/,
			/\bremote\b.*\boffice\b/,
			/\boffice\b.*\bremote\b/,
			/\bflexible\s+work/,
			/\bwork\s+from\s+home.*office\b/,
		]

		const onsitePatterns = [
			/\bon-?site\b/,
			/\bin-?office\b/,
			/\boffice-?based\b/,
			/\bmust\s+be\s+located\b/,
			/\brelocate\s+to\b/,
		]

		for (const pattern of remotePatterns) {
			if (pattern.test(fullText)) return 'Remote'
		}

		for (const pattern of hybridPatterns) {
			if (pattern.test(fullText)) return 'Hybrid'
		}

		for (const pattern of onsitePatterns) {
			if (pattern.test(fullText)) return 'On-site'
		}

		// Check work type specific selectors
		const workTypeSelectors = [
			'[data-work-type]',
			'.work-type',
			'.remote-status',
			'[class*="work-type"]',
			'[class*="remote"]',
		]

		for (const selector of workTypeSelectors) {
			const workTypeText = $(selector).text().toLowerCase()
			if (workTypeText.includes('remote')) return 'Remote'
			if (workTypeText.includes('hybrid')) return 'Hybrid'
			if (workTypeText.includes('office') || workTypeText.includes('site')) return 'On-site'
		}

		return undefined
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

Main parsing method with strategy pattern
*/
	async parse(url: string): Promise<ParserResult> {
		const startTime = Date.now()
		try {
			// Validate URL
			const validation = this.validateUrl(url)
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
			} catch (error: any) {
				return {
					success: false,
					error: error.message || 'Failed to fetch job posting',
				}
			}

			// Sanitize HTML
			const cleanHtml = this.sanitizeHTML(html)

			// Parse HTML
			const $ = cheerio.load(cleanHtml)

			// Extract readable content
			const { text: readableText, markdown } = this.extractReadableContent(cleanHtml, url)

			// Determine parsing strategy
			const strategy = this.getParserStrategy(url)
			let parsedData: Partial<ParsedJobData> = {}

			// Apply domain-specific parser
			switch (strategy) {
				case 'linkedin':
					parsedData = this.parseLinkedIn($)
					break
				case 'indeed':
					parsedData = this.parseIndeed($)
					break
				case 'glassdoor':
					parsedData = this.parseGlassdoor($)
					break
				case 'greenhouse':
					parsedData = this.parseGreenhouse($)
					break
				case 'lever':
					parsedData = this.parseLever($)
					break
				case 'workday':
					parsedData = this.parseWorkday($)
					break
				default:
					parsedData = this.parseGeneric($, readableText, url)
			}

			// Fill in any missing fields with generic parsing
			const genericData = this.parseGeneric($, readableText, url)
			parsedData = {
				...genericData,
				...parsedData, // Domain-specific takes priority
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

			return {
				success: true,
				data: {
					...parsedData,
					description: markdown.slice(0, 2000), // First 2000 chars
					confidence,
					source: hostname,
					extractedFields,
				} as ParsedJobData,
				rawText: readableText.slice(0, 1000),
				debugInfo: {
					domain: hostname,
					parserUsed: strategy,
					processingTime,
				},
			}
		} catch (error: any) {
			console.error('Job parser error:', error)
			return {
				success: false,
				error: error.message || 'Failed to parse job posting',
				debugInfo: {
					domain: urlParse(url).hostname,
					parserUsed: 'error',
					processingTime: Date.now() - startTime,
				},
			}
		}
	}

	/**

Get list of supported domains
*/
	getSupportedDomains(): string[] {
		return [...ALLOWED_DOMAINS]
	}

	/**

Check if a URL is supported without parsing
*/
	isSupported(url: string): boolean {
		return this.validateUrl(url).valid
	}
}

export const jobParser = new JobParser()
export type { ParsedJobData, ParserResult }
