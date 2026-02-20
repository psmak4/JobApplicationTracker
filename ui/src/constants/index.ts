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

/**
 * Design System 2.0 - Enhanced Status Theme
 *
 * Features:
 * - Refined badge styles with ring borders
 * - Improved color contrast for accessibility
 * - Smooth transitions and hover states
 * - Status bar colors for list items
 * - Hero section gradient accents
 */
export const STATUS_THEME: Record<
	ApplicationStatus,
	{
		// Solid background color (for buttons, status bars)
		solid: string
		// Badge styling (enhanced with rings and better contrast)
		badge: {
			base: string // Base badge classes
			light: string // Light mode colors
			dark: string // Dark mode colors
		}
		// Status bar for list/card items
		statusBar: {
			base: string
			hover: string
		}
		// Hero section accent colors
		hero: {
			gradient: string
			border: string
			ring: string
		}
	}
> = {
	Applied: {
		solid: 'bg-blue-600 dark:bg-blue-500',
		badge: {
			base: 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-all',
			light: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/10',
			dark: 'dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20',
		},
		statusBar: {
			base: 'bg-blue-600 dark:bg-blue-400',
			hover: 'group-hover:w-2',
		},
		hero: {
			gradient: 'from-blue-50/50 via-transparent to-transparent dark:from-blue-500/5',
			border: 'border-blue-200 dark:border-blue-500/30',
			ring: 'ring-blue-500/10 dark:ring-blue-400/10',
		},
	},
	Interviewing: {
		solid: 'bg-purple-600 dark:bg-purple-500',
		badge: {
			base: 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-all',
			light: 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/10',
			dark: 'dark:bg-purple-500/10 dark:text-purple-400 dark:ring-purple-500/20',
		},
		statusBar: {
			base: 'bg-purple-600 dark:bg-purple-400',
			hover: 'group-hover:w-2',
		},
		hero: {
			gradient: 'from-purple-50/50 via-transparent to-transparent dark:from-purple-500/5',
			border: 'border-purple-200 dark:border-purple-500/30',
			ring: 'ring-purple-500/10 dark:ring-purple-400/10',
		},
	},
	'Offer Received': {
		solid: 'bg-amber-600 dark:bg-amber-500',
		badge: {
			base: 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-all',
			light: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/10',
			dark: 'dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20',
		},
		statusBar: {
			base: 'bg-amber-600 dark:bg-amber-400',
			hover: 'group-hover:w-2',
		},
		hero: {
			gradient: 'from-amber-50/50 via-transparent to-transparent dark:from-amber-500/5',
			border: 'border-amber-200 dark:border-amber-500/30',
			ring: 'ring-amber-500/10 dark:ring-amber-400/10',
		},
	},
	'Offer Accepted': {
		solid: 'bg-green-600 dark:bg-green-500',
		badge: {
			base: 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-all',
			light: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/10',
			dark: 'dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20',
		},
		statusBar: {
			base: 'bg-green-600 dark:bg-green-400',
			hover: 'group-hover:w-2',
		},
		hero: {
			gradient: 'from-green-50/50 via-transparent to-transparent dark:from-green-500/5',
			border: 'border-green-200 dark:border-green-500/30',
			ring: 'ring-green-500/10 dark:ring-green-400/10',
		},
	},
	'Offer Declined': {
		solid: 'bg-orange-600 dark:bg-orange-500',
		badge: {
			base: 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-all',
			light: 'bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-600/10',
			dark: 'dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500/20',
		},
		statusBar: {
			base: 'bg-orange-600 dark:bg-orange-400',
			hover: 'group-hover:w-2',
		},
		hero: {
			gradient: 'from-orange-50/50 via-transparent to-transparent dark:from-orange-500/5',
			border: 'border-orange-200 dark:border-orange-500/30',
			ring: 'ring-orange-500/10 dark:ring-orange-400/10',
		},
	},
	Rejected: {
		solid: 'bg-red-600 dark:bg-red-500',
		badge: {
			base: 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-all',
			light: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10',
			dark: 'dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20',
		},
		statusBar: {
			base: 'bg-red-600 dark:bg-red-400',
			hover: 'group-hover:w-2',
		},
		hero: {
			gradient: 'from-red-50/50 via-transparent to-transparent dark:from-red-500/5',
			border: 'border-red-200 dark:border-red-500/30',
			ring: 'ring-red-500/10 dark:ring-red-400/10',
		},
	},
	Withdrawn: {
		solid: 'bg-slate-600 dark:bg-slate-500',
		badge: {
			base: 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-all',
			light: 'bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-600/10',
			dark: 'dark:bg-slate-500/10 dark:text-slate-400 dark:ring-slate-500/20',
		},
		statusBar: {
			base: 'bg-slate-600 dark:bg-slate-400',
			hover: 'group-hover:w-2',
		},
		hero: {
			gradient: 'from-slate-50/50 via-transparent to-transparent dark:from-slate-500/5',
			border: 'border-slate-200 dark:border-slate-500/30',
			ring: 'ring-slate-500/10 dark:ring-slate-400/10',
		},
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

/**
 * Helper function to get complete badge classes for a status
 */
export function getStatusBadgeClasses(status: ApplicationStatus): string {
	const theme = STATUS_THEME[status]
	return `${theme.badge.base} ${theme.badge.light} ${theme.badge.dark}`
}

/**
 * Helper function to get status bar classes
 */
export function getStatusBarClasses(status: ApplicationStatus): string {
	const theme = STATUS_THEME[status]
	return `${theme.statusBar.base} ${theme.statusBar.hover}`
}
