import type * as cheerio from 'cheerio'
import type { JobParserStrategy, ParsedJobData } from './types'

export class GlassdoorParser implements JobParserStrategy {
	name = 'glassdoor'

	canParse(url: string): boolean {
		return url.includes('glassdoor.com')
	}

	parse($: cheerio.CheerioAPI): Partial<ParsedJobData> {
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
}
