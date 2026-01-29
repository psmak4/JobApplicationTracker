import type * as cheerio from 'cheerio'
import type { JobParserStrategy, ParsedJobData } from './types'

export class IndeedParser implements JobParserStrategy {
	name = 'indeed'

	canParse(url: string): boolean {
		return url.includes('indeed.com')
	}

	parse($: cheerio.CheerioAPI): Partial<ParsedJobData> {
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
}
