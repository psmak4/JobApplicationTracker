export type ApplicationStatus =
	| 'Applied'
	| 'Phone Screen'
	| 'Technical Interview'
	| 'On-site Interview'
	| 'Offer'
	| 'Rejected'
	| 'Withdrawn'
	| 'Other'

export type WorkType = 'Remote' | 'Hybrid' | 'On-site'

export interface StatusHistoryEntry {
	id: string // UUID
	status: ApplicationStatus
	date: string // ISO date
	createdAt: string // ISO date
}

export interface Application {
	id: string // UUID
	company: string
	jobTitle: string
	jobDescriptionUrl?: string
	salary?: string
	location?: string // City, State
	workType?: WorkType
	contactInfo?: string
	notes?: string
	statusHistory: StatusHistoryEntry[]
	createdAt: string // ISO date
	updatedAt: string // ISO date
}
