import type { AxiosError } from 'axios'

export type ApplicationStatus =
	| 'Applied'
	| 'Interviewing'
	| 'Offer Received'
	| 'Offer Accepted'
	| 'Offer Declined'
	| 'Rejected'
	| 'Withdrawn'

export type WorkType = 'Remote' | 'Hybrid' | 'On-site'

/** @deprecated Status history is no longer used. Kept for type compatibility. */
export interface StatusHistoryEntry {
	id: string // UUID
	status: ApplicationStatus
	date: string // ISO timestamp
	createdAt: string // ISO timestamp
}

// Calendar event linked to an application
export interface CalendarEventEntry {
	id: string // UUID
	applicationId: string
	googleEventId?: string
	title: string
	url?: string
	startTime: string // ISO timestamp
	endTime?: string // ISO timestamp
	createdAt: string // ISO timestamp
}

// Upcoming event for dashboard display (includes application context)
export interface UpcomingEventEntry {
	id: string
	applicationId: string
	googleEventId?: string
	title: string
	url?: string
	startTime: string
	endTime?: string
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
	status: ApplicationStatus
	appliedAt: string // ISO timestamp
	statusUpdatedAt: string // ISO timestamp
	calendarEvents: CalendarEventEntry[]
	createdAt: string // ISO timestamp
	updatedAt: string // ISO timestamp
	archivedAt?: string | null
}

export interface ApplicationSummary {
	id: string // UUID
	company: string
	jobTitle: string
	jobDescriptionUrl?: string
	salary?: string
	location?: string // City, State
	workType?: WorkType
	contactInfo?: string
	notes?: string
	status: ApplicationStatus
	appliedAt: string // ISO timestamp
	statusUpdatedAt: string // ISO timestamp
	createdAt: string // ISO timestamp
	updatedAt: string // ISO timestamp
	archivedAt?: string | null
	upcomingEvents: UpcomingEventEntry[]
}

// API Response types for standardized backend responses
export interface ApiError {
	code: string
	message: string
	details?: Record<string, string[]>
}

export interface ApiMeta {
	timestamp: string
	requestId: string
	[key: string]: unknown
}

export interface ApiSuccessResponse<T> {
	success: true
	data: T
	meta: ApiMeta
}

export interface ApiErrorResponse {
	success: false
	error: ApiError
	meta: ApiMeta
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

// Helper type guard to check if response is success
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
	return response.success === true
}

// Error types for mutations
export type MutationError = Error | AxiosError<ApiErrorResponse>

// Type guard to check if error is an Axios error
export function isAxiosError(error: MutationError): error is AxiosError<ApiErrorResponse> {
	return 'isAxiosError' in error && error.isAxiosError === true
}
