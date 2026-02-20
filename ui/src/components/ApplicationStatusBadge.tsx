import { getStatusBadgeClasses } from '@/constants'
import type { ApplicationStatus } from '@/types'

interface ApplicationStatusBadgeProps {
	status: ApplicationStatus
}

export function ApplicationStatusBadge({ status }: ApplicationStatusBadgeProps) {
	return <span className={getStatusBadgeClasses(status)}>{status}</span>
}
