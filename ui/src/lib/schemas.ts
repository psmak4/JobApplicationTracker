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

/**
 * Shared password validation schema.
 * Reused across profile page and anywhere password validation is needed.
 */
export const passwordSchema = z
	.string()
	.min(8, 'Password must be at least 8 characters')
	.regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
	.regex(/[a-z]/, 'Password must contain at least one lowercase letter')
	.regex(/[0-9]/, 'Password must contain at least one number')

/**
 * Profile form validation schema.
 */
export const profileSchema = z.object({
	name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
})

/**
 * Change password form validation schema.
 */
export const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, 'Current password is required'),
		newPassword: passwordSchema,
		confirmPassword: z.string().min(1, 'Please confirm your new password'),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword'],
	})

export type ProfileFormValues = z.infer<typeof profileSchema>
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>

/**
 * Signup form validation schema.
 */
export const signupSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	email: z.string().email('Invalid email address'),
	password: passwordSchema,
})

export type SignupFormValues = z.infer<typeof signupSchema>

/**
 * Login form validation schema.
 */
export const loginSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(1, 'Password is required'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

/**
 * Forgot password form validation schema.
 */
export const forgotPasswordSchema = z.object({
	email: z.string().email('Invalid email address'),
})

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>
