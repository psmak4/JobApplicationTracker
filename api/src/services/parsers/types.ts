import type * as cheerio from 'cheerio'

export interface ParsedJobData {
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

export interface JobParserStrategy {
	canParse(url: string): boolean
	parse($: cheerio.CheerioAPI, text: string, url: string): Partial<ParsedJobData>
	name: string
}
