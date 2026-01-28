import { Request, Response } from 'express'
import { z } from 'zod'
import { jobParser } from '../services/jobParser'

const parseJobSchema = z.object({
	url: z.url('Must be a valid URL'),
})

export const parserController = {
	// Parse job posting from URL
	parseJob: async (req: Request, res: Response) => {
		try {
			const validation = parseJobSchema.safeParse(req.body)

			if (!validation.success) {
				res.status(400).json({ errors: validation.error.format() })
				return
			}

			const { url } = validation.data

			// Parse the job posting
			const result = await jobParser.parse(url)

			if (!result.success) {
				res.status(400).json({
					success: false,
					error: result.error,
					message: 'Failed to parse job posting from the provided URL',
				})
				return
			}

			res.json({
				success: true,
				data: result.data,
				rawText: result.rawText,
				message:
					result.data?.confidence === 'low'
						? 'Some information could not be extracted. Please verify and fill in missing details.'
						: 'Job posting parsed successfully',
			})
		} catch (error) {
			console.error('Error parsing job:', error)
			res.status(500).json({
				success: false,
				error: 'Internal server error',
				message: 'Failed to parse job posting',
			})
		}
	},

	// Get list of supported job boards
	getSupportedSites: (_req: Request, res: Response) => {
		const supportedSites = [
			{ name: 'LinkedIn', domain: 'linkedin.com', popular: true },
			{ name: 'Indeed', domain: 'indeed.com', popular: true },
			{ name: 'Glassdoor', domain: 'glassdoor.com', popular: true },
			{ name: 'Monster', domain: 'monster.com', popular: false },
			{ name: 'ZipRecruiter', domain: 'ziprecruiter.com', popular: false },
			{ name: 'Google Careers', domain: 'careers.google.com', popular: false },
			{ name: 'Apple Jobs', domain: 'jobs.apple.com', popular: false },
			{ name: 'Amazon Jobs', domain: 'amazon.jobs', popular: false },
			{ name: 'Greenhouse', domain: 'greenhouse.io', popular: false },
			{ name: 'Lever', domain: 'lever.co', popular: false },
			{ name: 'Workday', domain: 'workday.com', popular: false },
		]

		res.json({ supportedSites })
	},
}
