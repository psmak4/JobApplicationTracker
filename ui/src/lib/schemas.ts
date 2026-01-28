import * as z from 'zod'

/**
 * Shared Zod schema for application form validation.
 * Used by both NewApplication and ApplicationEdit pages.
 */
export const applicationSchema = z.object({
	company: z.string().min(1, 'Company name is required'),
	jobTitle: z.string().min(1, 'Job title is required'),
	jobDescriptionUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
	salary: z.string().optional(),
	location: z.string().optional(),
	workType: z.enum(['Remote', 'Hybrid', 'On-site'] as [string, ...string[]]).optional(),
	contactInfo: z.string().optional(),
	notes: z.string().optional(),
})

/**
 * Extended schema for creating a new application (includes initial status).
 */
export const newApplicationSchema = applicationSchema.extend({
	initialStatus: z.enum([
		'Applied',
		'Phone Screen',
		'Technical Interview',
		'On-site Interview',
		'Offer',
		'Rejected',
		'Withdrawn',
		'Other',
	] as [string, ...string[]]),
	initialStatusDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
		message: 'Invalid date',
	}),
})

export type ApplicationFormValues = z.infer<typeof applicationSchema>
export type NewApplicationFormValues = z.infer<typeof newApplicationSchema>
