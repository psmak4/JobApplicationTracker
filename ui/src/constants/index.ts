import type { ApplicationStatus, WorkType } from '@/types'

/**
 * Application status options for dropdowns and filters.
 * This is the single source of truth for all status values in the UI.
 */
export const APPLICATION_STATUS_OPTIONS: ApplicationStatus[] = [
	'Applied',
	'Interviewing',
	'Offer Received',
	'Rejected',
	'Withdrawn',
]

/**
 * Work type options for dropdowns.
 */
export const WORK_TYPE_OPTIONS: { value: WorkType; label: string }[] = [
	{ value: 'Remote', label: 'Remote' },
	{ value: 'Hybrid', label: 'Hybrid' },
	{ value: 'On-site', label: 'On-site' },
]
