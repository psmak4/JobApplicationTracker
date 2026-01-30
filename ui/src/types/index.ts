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
	date: string // ISO timestamp
	createdAt: string // ISO timestamp
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
	createdAt: string // ISO timestamp
	updatedAt: string // ISO timestamp
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
	createdAt: string // ISO timestamp
	updatedAt: string // ISO timestamp
}
