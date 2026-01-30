import { Request, Response } from 'express'
import { z } from 'zod'
import { errorResponse, successResponse } from '../utils/responses'
import { jobParser } from '../services/jobParser'

// Helper to get request ID from request object
const getRequestId = (req: Request): string => req.requestId || 'unknown'

const parseJobSchema = z.object({
	url: z.url('Must be a valid URL'),
})

export const parserController = {
	// Parse job posting from URL
	parseJob: async (req: Request, res: Response) => {
		try {
			const validation = parseJobSchema.safeParse(req.body)

			if (!validation.success) {
				// Let the error handler middleware handle Zod errors for consistent formatting
				throw validation.error
			}

			const { url } = validation.data

			// Parse the job posting
			const result = await jobParser.parse(url)

			if (!result.success) {
				res.status(400).json(
					errorResponse(
						'PARSING_ERROR',
						result.error || 'Failed to parse job posting from the provided URL',
						getRequestId(req),
					),
				)
				return
			}

			const message =
				result.data?.confidence === 'low'
					? 'Some information could not be extracted. Please verify and fill in missing details.'
					: 'Job posting parsed successfully'

			res.json(
				successResponse(
					{
						data: result.data,
						rawText: result.rawText,
						message,
					},
					getRequestId(req),
				),
			)
		} catch (error) {
			console.error('Error parsing job:', error)
			res.status(500).json(
				errorResponse('INTERNAL_ERROR', 'Failed to parse job posting', getRequestId(req)),
			)
		}
	},

	// Get list of supported job boards
	getSupportedSites: (req: Request, res: Response) => {
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

		res.json(successResponse({ supportedSites }, getRequestId(req)))
	},
}
