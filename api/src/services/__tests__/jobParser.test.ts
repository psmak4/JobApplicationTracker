import axios, { type AxiosStatic } from 'axios'
import { type MockInstance, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { jobParser } from '../jobParser'
import {
	genericJobHtml,
	glassdoorJobHtml,
	greenhouseJobHtml,
	indeedJobHtml,
	leverJobHtml,
	linkedInJobHtml,
	minimalJobHtml,
	schemaWithDirectSalaryValue,
	workdayJobHtml,
} from './fixtures/jobHtmlFixtures'

// Mock axios module
vi.mock('axios')

// Helper to create mock axios response
function createMockResponse(data: string, url: string, options?: { status?: number; redirectUrl?: string }) {
	const status = options?.status ?? 200
	return {
		status,
		statusText: status === 200 ? 'OK' : status === 404 ? 'Not Found' : status === 403 ? 'Forbidden' : 'Error',
		data,
		config: { url },
		request: {
			res: {
				responseUrl: options?.redirectUrl ?? url,
			},
		},
	}
}

describe('JobParser', () => {
	let mockAxiosGet: MockInstance
	const cacheUrls = [
		'https://www.linkedin.com/jobs/view/12345',
		'https://linkedin.com/jobs/view/12345',
		'https://www.indeed.com/viewjob?jk=abc123',
		'https://indeed.com/jobs/job-title-company',
		'https://www.glassdoor.com/job-listing/software-engineer',
		'https://boards.greenhouse.io/company/jobs/12345',
		'https://jobs.lever.co/company/position-id',
		'https://company.myworkdayjobs.com/en-US/careers/job/12345',
		'https://careers.google.com/jobs/results/12345',
		'https://careers.google.com/jobs/results/99999',
		'https://www.linkedin.com/jobs/view/deleted',
		'https://www.linkedin.com/jobs/view/blocked',
		'https://www.linkedin.com/jobs/view/12345-redirected',
	]

	beforeEach(() => {
		vi.clearAllMocks()
		mockAxiosGet = vi.mocked(axios.get)
		for (const url of cacheUrls) {
			jobParser.clearCache(url)
		}
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('URL Validation', () => {
		it('should validate LinkedIn job URLs', async () => {
			expect(await jobParser.isSupported('https://www.linkedin.com/jobs/view/12345')).toBe(true)
			expect(await jobParser.isSupported('https://linkedin.com/jobs/view/12345')).toBe(true)
		})

		it('should validate Indeed job URLs', async () => {
			expect(await jobParser.isSupported('https://www.indeed.com/viewjob?jk=abc123')).toBe(true)
			expect(await jobParser.isSupported('https://indeed.com/jobs/job-title-company')).toBe(true)
		})

		it('should validate Glassdoor job URLs', async () => {
			expect(await jobParser.isSupported('https://www.glassdoor.com/job-listing/software-engineer')).toBe(true)
		})

		it('should validate Greenhouse job URLs', async () => {
			expect(await jobParser.isSupported('https://boards.greenhouse.io/company/jobs/12345')).toBe(true)
		})

		it('should validate Lever job URLs', async () => {
			expect(await jobParser.isSupported('https://jobs.lever.co/company/position-id')).toBe(true)
		})

		it('should validate Workday job URLs', async () => {
			expect(await jobParser.isSupported('https://company.myworkdayjobs.com/en-US/careers/job/12345')).toBe(true)
		})

		it('should reject non-job URLs', async () => {
			expect(await jobParser.isSupported('https://google.com')).toBe(false)
			expect(await jobParser.isSupported('https://example.com/not-a-job')).toBe(false)
		})

		it('should reject non-allowed domains', async () => {
			expect(await jobParser.isSupported('https://randomsite.com/jobs/12345')).toBe(false)
		})

		it('should reject non-HTTP protocols', async () => {
			expect(await jobParser.isSupported('ftp://linkedin.com/jobs/view/12345')).toBe(false)
			expect(await jobParser.isSupported('file:///jobs/local-file')).toBe(false)
		})

		it('should reject URLs that look like job boards but not job postings', async () => {
			expect(await jobParser.isSupported('https://linkedin.com/feed')).toBe(false)
		})
	})

	describe('getSupportedDomains', () => {
		it('should return a list of supported domains', () => {
			const domains = jobParser.getSupportedDomains()
			expect(domains).toContain('linkedin.com')
			expect(domains).toContain('indeed.com')
			expect(domains).toContain('glassdoor.com')
			expect(domains).toContain('greenhouse.io')
			expect(domains).toContain('lever.co')
			expect(Array.isArray(domains)).toBe(true)
			expect(domains.length).toBeGreaterThan(0)
		})
	})

	describe('LinkedIn Parser', () => {
		it('should parse LinkedIn job postings', async () => {
			mockAxiosGet.mockResolvedValueOnce(
				createMockResponse(linkedInJobHtml, 'https://www.linkedin.com/jobs/view/12345'),
			)

			const result = await jobParser.parse('https://www.linkedin.com/jobs/view/12345')

			expect(result.success).toBe(true)
			expect(result.data?.jobTitle).toBe('Software Engineer')
			expect(result.data?.company).toBe('Acme Corp')
			expect(result.data?.location).toBe('San Francisco, CA')
			expect(result.data?.workType).toBe('Remote')
			expect(result.debugInfo?.parserUsed).toBe('linkedin')
		})
	})

	describe('Indeed Parser', () => {
		it('should parse Indeed job postings', async () => {
			mockAxiosGet.mockResolvedValueOnce(
				createMockResponse(indeedJobHtml, 'https://www.indeed.com/viewjob?jk=abc123'),
			)

			const result = await jobParser.parse('https://www.indeed.com/viewjob?jk=abc123')

			expect(result.success).toBe(true)
			expect(result.data?.jobTitle).toBe('Senior Developer')
			expect(result.data?.company).toBe('TechStart Inc')
			expect(result.data?.location).toBe('New York, NY')
			expect(result.data?.salary).toContain('$150,000')
			expect(result.data?.workType).toBe('Hybrid')
			expect(result.debugInfo?.parserUsed).toBe('indeed')
		})
	})

	describe('Glassdoor Parser', () => {
		it('should parse Glassdoor job postings', async () => {
			mockAxiosGet.mockResolvedValueOnce(
				createMockResponse(glassdoorJobHtml, 'https://www.glassdoor.com/job-listing/12345'),
			)

			const result = await jobParser.parse('https://www.glassdoor.com/job-listing/12345')

			expect(result.success).toBe(true)
			expect(result.data?.jobTitle).toBe('Product Manager')
			expect(result.data?.company).toBe('StartupXYZ')
			expect(result.data?.location).toBe('Austin, TX')
			expect(result.data?.salary).toContain('$120K')
			expect(result.data?.workType).toBe('Remote')
			expect(result.debugInfo?.parserUsed).toBe('glassdoor')
		})
	})

	describe('Greenhouse Parser', () => {
		it('should parse Greenhouse job postings', async () => {
			mockAxiosGet.mockResolvedValueOnce(
				createMockResponse(greenhouseJobHtml, 'https://boards.greenhouse.io/company/jobs/12345'),
			)

			const result = await jobParser.parse('https://boards.greenhouse.io/company/jobs/12345')

			expect(result.success).toBe(true)
			expect(result.data?.jobTitle).toBe('Backend Engineer')
			expect(result.data?.company).toBe('CloudTech')
			expect(result.data?.location).toBe('Seattle, WA')
			expect(result.data?.workType).toBe('On-site')
			expect(result.debugInfo?.parserUsed).toBe('greenhouse')
		})
	})

	describe('Lever Parser', () => {
		it('should parse Lever job postings', async () => {
			mockAxiosGet.mockResolvedValueOnce(
				createMockResponse(leverJobHtml, 'https://jobs.lever.co/company/position-id'),
			)

			const result = await jobParser.parse('https://jobs.lever.co/company/position-id')

			expect(result.success).toBe(true)
			expect(result.data?.jobTitle).toBe('Frontend Developer')
			expect(result.data?.company).toBe('DesignCo')
			expect(result.data?.workType).toBe('Remote')
			expect(result.debugInfo?.parserUsed).toBe('lever')
		})
	})

	describe('Workday Parser', () => {
		it('should parse Workday job postings', async () => {
			mockAxiosGet.mockResolvedValueOnce(
				createMockResponse(workdayJobHtml, 'https://company.myworkdayjobs.com/en-US/careers/job/12345'),
			)

			const result = await jobParser.parse('https://company.myworkdayjobs.com/en-US/careers/job/12345')

			expect(result.success).toBe(true)
			expect(result.data?.jobTitle).toBe('Data Scientist')
			expect(result.data?.company).toBe('BigData Inc')
			expect(result.data?.location).toBe('Boston, MA')
			expect(result.data?.workType).toBe('Hybrid')
			expect(result.debugInfo?.parserUsed).toBe('workday')
		})
	})

	describe('Generic Parser', () => {
		it('should parse generic job postings with schema.org data', async () => {
			mockAxiosGet.mockResolvedValueOnce(
				createMockResponse(genericJobHtml, 'https://careers.google.com/jobs/results/12345'),
			)

			const result = await jobParser.parse('https://careers.google.com/jobs/results/12345')

			expect(result.success).toBe(true)
			expect(result.data?.jobTitle).toBe('Marketing Manager')
			expect(result.data?.company).toBe('BrandCo')
			expect(result.data?.location).toBe('Chicago, IL')
			expect(result.data?.salary).toBeDefined()
			expect(result.data?.workType).toBe('On-site')
		})

		it('should handle pages with minimal job information', async () => {
			mockAxiosGet.mockResolvedValueOnce(
				createMockResponse(minimalJobHtml, 'https://careers.google.com/jobs/results/99999'),
			)

			const result = await jobParser.parse('https://careers.google.com/jobs/results/99999')

			expect(result.success).toBe(true)
			expect(['high', 'medium', 'low']).toContain(result.data?.confidence)
		})
	})

	describe('Salary Parsing', () => {
		it('should handle schema.org baseSalary with direct value', async () => {
			mockAxiosGet.mockResolvedValueOnce(
				createMockResponse(schemaWithDirectSalaryValue, 'https://careers.google.com/jobs/results/12345'),
			)

			const result = await jobParser.parse('https://careers.google.com/jobs/results/12345')

			expect(result.success).toBe(true)
			if (result.data?.salary) {
				expect(result.data.salary).toContain('120000')
			}
		})
	})

	describe('Confidence Scoring', () => {
		it('should return high confidence when all major fields are found', async () => {
			mockAxiosGet.mockResolvedValueOnce(
				createMockResponse(linkedInJobHtml, 'https://www.linkedin.com/jobs/view/12345'),
			)

			const result = await jobParser.parse('https://www.linkedin.com/jobs/view/12345')

			expect(result.data?.confidence).toBe('high')
			expect(result.data?.extractedFields).toContain('jobTitle')
			expect(result.data?.extractedFields).toContain('company')
		})

		it('should track extracted fields', async () => {
			mockAxiosGet.mockResolvedValueOnce(
				createMockResponse(linkedInJobHtml, 'https://www.linkedin.com/jobs/view/12345'),
			)

			const result = await jobParser.parse('https://www.linkedin.com/jobs/view/12345')

			expect(Array.isArray(result.data?.extractedFields)).toBe(true)
			expect(result.data?.extractedFields?.length).toBeGreaterThan(0)
		})
	})

	describe('Error Handling', () => {
		it('should return error for invalid URLs', async () => {
			const result = await jobParser.parse('not-a-valid-url')

			expect(result.success).toBe(false)
			expect(result.error).toBeDefined()
		})

		it('should return error for non-allowed domains', async () => {
			const result = await jobParser.parse('https://malicious-site.com/jobs/fake')

			expect(result.success).toBe(false)
			expect(result.error).toContain('not in the allowed list')
		})

		it('should handle HTTP 404 errors', async () => {
			mockAxiosGet.mockResolvedValue(
				createMockResponse('', 'https://www.linkedin.com/jobs/view/deleted', { status: 404 }),
			)

			const result = await jobParser.parse('https://www.linkedin.com/jobs/view/deleted')

			expect(result.success).toBe(false)
			expect(result.error).toContain('not found')
		})

		it('should handle HTTP 403 errors', async () => {
			mockAxiosGet.mockResolvedValue(
				createMockResponse('', 'https://www.linkedin.com/jobs/view/blocked', { status: 403 }),
			)

			const result = await jobParser.parse('https://www.linkedin.com/jobs/view/blocked')

			expect(result.success).toBe(false)
			expect(result.error).toContain('Access denied')
		})
	})

	describe('SSRF Protection', () => {
		it('should block redirects to non-allowed domains', async () => {
			mockAxiosGet.mockResolvedValue(
				createMockResponse('<html></html>', 'https://www.linkedin.com/jobs/view/12345', {
					redirectUrl: 'https://malicious-site.com/steal-data',
				}),
			)

			const result = await jobParser.parse('https://www.linkedin.com/jobs/view/12345')

			expect(result.success).toBe(false)
			expect(result.error).toContain('Redirect to non-allowed domain')
		})

		it('should allow redirects within allowed domains', async () => {
			mockAxiosGet.mockResolvedValueOnce(
				createMockResponse(linkedInJobHtml, 'https://www.linkedin.com/jobs/view/12345', {
					redirectUrl: 'https://www.linkedin.com/jobs/view/12345-redirected',
				}),
			)

			const result = await jobParser.parse('https://www.linkedin.com/jobs/view/12345')

			expect(result.success).toBe(true)
		})
	})

	describe('Debug Info', () => {
		it('should include debug information in results', async () => {
			mockAxiosGet.mockResolvedValueOnce(
				createMockResponse(linkedInJobHtml, 'https://www.linkedin.com/jobs/view/12345'),
			)

			const result = await jobParser.parse('https://www.linkedin.com/jobs/view/12345')

			expect(result.debugInfo).toBeDefined()
			expect(result.debugInfo?.domain).toBe('linkedin.com')
			expect(result.debugInfo?.parserUsed).toBe('linkedin')
			expect(result.debugInfo?.processingTime).toBeGreaterThanOrEqual(0)
		})
	})
})
