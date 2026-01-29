import type * as cheerio from 'cheerio'
import type { JobParserStrategy, ParsedJobData } from './types'

export class LinkedInParser implements JobParserStrategy {
	name = 'linkedin'

	canParse(url: string): boolean {
		return url.includes('linkedin.com')
	}

	parse($: cheerio.CheerioAPI): Partial<ParsedJobData> {
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
}
