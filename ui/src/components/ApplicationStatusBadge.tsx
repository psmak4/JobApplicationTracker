import { STATUS_COLORS } from '@/constants'
import type { ApplicationStatus } from '@/types'
import { Badge } from './ui/badge'

interface ApplicationStatusBadgeProps {
	status: ApplicationStatus
}

export function ApplicationStatusBadge({ status }: ApplicationStatusBadgeProps) {
	const colors = STATUS_COLORS[status]

	return (
		<Badge
			variant="outline"
			className={`${colors.bg} ${colors.text} ${colors.darkBg} ${colors.darkText} border-transparent font-semibold text-xs`}
		>
			{status}
		</Badge>
	)
}
