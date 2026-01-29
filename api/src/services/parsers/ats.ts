import type * as cheerio from 'cheerio'
import type { JobParserStrategy, ParsedJobData } from './types'

export class GreenhouseParser implements JobParserStrategy {
	name = 'greenhouse'

	canParse(url: string): boolean {
		return url.includes('greenhouse.io')
	}

	parse($: cheerio.CheerioAPI): Partial<ParsedJobData> {
		const data: Partial<ParsedJobData> = {}

		data.jobTitle = $('.app-title').first().text().trim() || $('h1.app-title').first().text().trim()
		data.company = $('.company-name').first().text().trim() || $('[class*="company"]').first().text().trim()
		data.location = $('.location').first().text().trim() || $('[class*="location"]').first().text().trim()

		return data
	}
}

export class LeverParser implements JobParserStrategy {
	name = 'lever'

	canParse(url: string): boolean {
		return url.includes('lever.co')
	}

	parse($: cheerio.CheerioAPI): Partial<ParsedJobData> {
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
}

export class WorkdayParser implements JobParserStrategy {
	name = 'workday'

	canParse(url: string): boolean {
		return url.includes('myworkdayjobs.com')
	}

	parse($: cheerio.CheerioAPI): Partial<ParsedJobData> {
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
}
