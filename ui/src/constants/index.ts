import type { ApplicationStatus, WorkType } from '@/types'

/**
 * Application status options for dropdowns and filters.
 * This is the single source of truth for all status values in the UI.
 */
export const APPLICATION_STATUS_OPTIONS: ApplicationStatus[] = [
	'Applied',
	'Interviewing',
	'Offer Received',
	'Offer Accepted',
	'Offer Declined',
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

/**
 * Kanban board column definitions.
 * The "Closed" column groups all terminal statuses.
 */
export const KANBAN_COLUMNS = ['Applied', 'Interviewing', 'Offer Received', 'Closed'] as const
export type KanbanColumn = (typeof KANBAN_COLUMNS)[number]

/** Statuses that appear in the "Closed" kanban column */
export const CLOSED_STATUSES: ApplicationStatus[] = ['Offer Accepted', 'Offer Declined', 'Rejected', 'Withdrawn']

/** Statuses for active/in-progress applications */
export const ACTIVE_STATUSES: ApplicationStatus[] = ['Applied', 'Interviewing', 'Offer Received']

/** Color mapping for status badges */
export const STATUS_COLORS: Record<ApplicationStatus, { bg: string; text: string; darkBg: string; darkText: string }> =
	{
		Applied: {
			bg: 'bg-[#8BE9FD]/15',
			text: 'text-[#036A96]',
			darkBg: 'dark:bg-[#8BE9FD]/20',
			darkText: 'dark:text-[#8BE9FD]',
		},
		Interviewing: {
			bg: 'bg-[#BD93F9]/15',
			text: 'text-[#644AC9]',
			darkBg: 'dark:bg-[#BD93F9]/20',
			darkText: 'dark:text-[#BD93F9]',
		},
		'Offer Received': {
			bg: 'bg-[#F1FA8C]/15',
			text: 'text-[#8B7E00]',
			darkBg: 'dark:bg-[#F1FA8C]/20',
			darkText: 'dark:text-[#F1FA8C]',
		},
		'Offer Accepted': {
			bg: 'bg-[#50FA7B]/15',
			text: 'text-[#14710A]',
			darkBg: 'dark:bg-[#50FA7B]/20',
			darkText: 'dark:text-[#50FA7B]',
		},
		'Offer Declined': {
			bg: 'bg-[#FFB86C]/15',
			text: 'text-[#9C5700]',
			darkBg: 'dark:bg-[#FFB86C]/20',
			darkText: 'dark:text-[#FFB86C]',
		},
		Rejected: {
			bg: 'bg-[#FF5555]/15',
			text: 'text-[#CB3A2A]',
			darkBg: 'dark:bg-[#FF5555]/20',
			darkText: 'dark:text-[#FF5555]',
		},
		Withdrawn: {
			bg: 'bg-[#6272A4]/15',
			text: 'text-[#6C664B]',
			darkBg: 'dark:bg-[#6272A4]/20',
			darkText: 'dark:text-[#6272A4]',
		},
	}

/** Accent colors for hero section gradients and borders */
export const STATUS_ACCENT_COLORS: Record<ApplicationStatus, { gradient: string; border: string; dot: string }> = {
	Applied: {
		gradient: 'from-[#8BE9FD]/10 via-transparent to-transparent dark:from-[#8BE9FD]/15',
		border: 'border-[#8BE9FD]/30 dark:border-[#8BE9FD]/40',
		dot: 'bg-[#036A96] dark:bg-[#8BE9FD]',
	},
	Interviewing: {
		gradient: 'from-[#BD93F9]/10 via-transparent to-transparent dark:from-[#BD93F9]/15',
		border: 'border-[#BD93F9]/30 dark:border-[#BD93F9]/40',
		dot: 'bg-[#644AC9] dark:bg-[#BD93F9]',
	},
	'Offer Received': {
		gradient: 'from-[#F1FA8C]/10 via-transparent to-transparent dark:from-[#F1FA8C]/15',
		border: 'border-[#F1FA8C]/30 dark:border-[#F1FA8C]/40',
		dot: 'bg-[#8B7E00] dark:bg-[#F1FA8C]',
	},
	'Offer Accepted': {
		gradient: 'from-[#50FA7B]/10 via-transparent to-transparent dark:from-[#50FA7B]/15',
		border: 'border-[#50FA7B]/30 dark:border-[#50FA7B]/40',
		dot: 'bg-[#14710A] dark:bg-[#50FA7B]',
	},
	'Offer Declined': {
		gradient: 'from-[#FFB86C]/10 via-transparent to-transparent dark:from-[#FFB86C]/15',
		border: 'border-[#FFB86C]/30 dark:border-[#FFB86C]/40',
		dot: 'bg-[#9C5700] dark:bg-[#FFB86C]',
	},
	Rejected: {
		gradient: 'from-[#FF5555]/10 via-transparent to-transparent dark:from-[#FF5555]/15',
		border: 'border-[#FF5555]/30 dark:border-[#FF5555]/40',
		dot: 'bg-[#CB3A2A] dark:bg-[#FF5555]',
	},
	Withdrawn: {
		gradient: 'from-[#6272A4]/10 via-transparent to-transparent dark:from-[#6272A4]/15',
		border: 'border-[#6272A4]/30 dark:border-[#6272A4]/40',
		dot: 'bg-[#6C664B] dark:bg-[#6272A4]',
	},
}

/** Pipeline steps for the status timeline */
export const PIPELINE_STEPS: Array<{
	key: string
	label: string
	statuses: ApplicationStatus[]
}> = [
	{ key: 'Applied', label: 'Applied', statuses: ['Applied'] },
	{ key: 'Interviewing', label: 'Interviewing', statuses: ['Interviewing'] },
	{ key: 'Offer', label: 'Offer', statuses: ['Offer Received', 'Offer Accepted', 'Offer Declined'] },
	{ key: 'Closed', label: 'Closed', statuses: ['Offer Accepted', 'Offer Declined', 'Rejected', 'Withdrawn'] },
]
