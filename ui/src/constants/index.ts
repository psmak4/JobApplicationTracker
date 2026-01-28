import type { ApplicationStatus, WorkType } from '../types'

/**
 * Application status options for dropdowns and filters.
 * This is the single source of truth for all status values in the UI.
 */
export const APPLICATION_STATUS_OPTIONS: ApplicationStatus[] = [
	'Applied',
	'Phone Screen',
	'Technical Interview',
	'On-site Interview',
	'Offer',
	'Rejected',
	'Withdrawn',
	'Other',
]

/**
 * Work type options for dropdowns.
 */
export const WORK_TYPE_OPTIONS: WorkType[] = ['Remote', 'Hybrid', 'On-site']
