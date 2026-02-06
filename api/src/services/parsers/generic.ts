import type * as cheerio from 'cheerio'
import he from 'he'
import urlParse from 'url-parse'
import type { JobParserStrategy, ParsedJobData } from './types'

export class GenericParser implements JobParserStrategy {
	name = 'generic'

	canParse(): boolean {
		return true // Fallback for all URLs
	}

	parse($: cheerio.CheerioAPI, text: string, url: string): Partial<ParsedJobData> {
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
		const companyFromSchema = this.extractFromSchema(($) => {
			const jobPosting = this.findJobPostingFromSchema($)
			if (jobPosting?.hiringOrganization?.name) {
				return jobPosting.hiringOrganization.name
			}
			return undefined
		}, $)

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
		const titleFromSchema = this.extractFromSchema(($) => {
			const jobPosting = this.findJobPostingFromSchema($)
			if (jobPosting?.title) {
				return jobPosting.title
			}
			return undefined
		}, $)

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
		const locationFromSchema = this.extractFromSchema(($) => {
			const jobPosting = this.findJobPostingFromSchema($)
			if (!jobPosting?.jobLocation) return undefined

			const locations = Array.isArray(jobPosting.jobLocation)
				? jobPosting.jobLocation
				: [jobPosting.jobLocation]

			for (const location of locations) {
				const address = location?.address
				if (!address) continue

				if (typeof address === 'string') {
					return address
				}

				const addr = address
				const formatted = [addr.addressLocality, addr.addressRegion].filter(Boolean).join(', ')
				if (formatted) return formatted
			}

			return undefined
		}, $)

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
		const salaryFromSchema = this.extractFromSchema(($) => {
			const jobPosting = this.findJobPostingFromSchema($)
			if (!jobPosting?.baseSalary) return undefined

			const salary = jobPosting.baseSalary
			const unitText = salary.unitText || salary.value?.unitText || 'per year'

			if (salary.value?.minValue != null && salary.value?.maxValue != null) {
				return `$${salary.value.minValue} - $${salary.value.maxValue} ${unitText}`
			}

			if (salary.value != null && salary.value.value != null) {
				return `$${salary.value.value} ${unitText}`
			}

			if (typeof salary.value === 'number' || typeof salary.value === 'string') {
				return `$${salary.value} ${unitText}`
			}

			return undefined
		}, $)

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

	private extractFromSchema<T>(resolver: ($: cheerio.CheerioAPI) => T | undefined, $: cheerio.CheerioAPI) {
		try {
			return resolver($)
		} catch {
			return undefined
		}
	}

	private findJobPostingFromSchema($: cheerio.CheerioAPI): Record<string, any> | undefined {
		const structuredData = $('script[type="application/ld+json"]')
		let jobPosting: Record<string, any> | undefined

		const extractJobPosting = (data: any): Record<string, any> | undefined => {
			if (!data) return undefined

			if (Array.isArray(data)) {
				for (const entry of data) {
					const found = extractJobPosting(entry)
					if (found) return found
				}
			}

			if (data['@graph'] && Array.isArray(data['@graph'])) {
				for (const entry of data['@graph']) {
					const found = extractJobPosting(entry)
					if (found) return found
				}
			}

			if (data['@type'] === 'JobPosting') {
				return data
			}

			return undefined
		}

		structuredData.each((_, elem) => {
			try {
				const html = $(elem).html()
				if (!html) return
				const data = JSON.parse(html)
				const found = extractJobPosting(data)
				if (found) {
					jobPosting = found
					return false
				}
			} catch {}
		})

		return jobPosting
	}
}
