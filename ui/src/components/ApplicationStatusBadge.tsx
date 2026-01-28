import { useMemo } from 'react'
import type { ApplicationStatus } from '@/types'
import { Badge } from './ui/badge'

interface Props {
	currentStatus: ApplicationStatus | 'Unknown'
}

type BadgeVariant = 'default' | 'destructive' | 'secondary' | 'outline'

const getStatusColor = (status: ApplicationStatus | 'Unknown'): string => {
	switch (status) {
		case 'Applied':
			return 'bg-blue-100 text-blue-800 hover:bg-blue-100/80 border-transparent dark:bg-blue-900/30 dark:text-blue-400'
		case 'Phone Screen':
			return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100/80 border-transparent dark:bg-indigo-900/30 dark:text-indigo-400'
		case 'Technical Interview':
			return 'bg-purple-100 text-purple-800 hover:bg-purple-100/80 border-transparent dark:bg-purple-900/30 dark:text-purple-400'
		case 'On-site Interview':
			return 'bg-orange-100 text-orange-800 hover:bg-orange-100/80 border-transparent dark:bg-orange-900/30 dark:text-orange-400'
		case 'Offer':
			return 'bg-green-100 text-green-800 hover:bg-green-100/80 border-transparent dark:bg-green-900/30 dark:text-green-400'
		case 'Rejected':
			return 'destructive'
		case 'Withdrawn':
			return 'secondary'
		case 'Other':
			return 'bg-slate-100 text-slate-800 hover:bg-slate-100/80 border-transparent dark:bg-slate-900/30 dark:text-slate-400'
		default:
			return 'outline'
	}
}

const VARIANT_KEYWORDS = ['destructive', 'secondary', 'outline']

const ApplicationStatusBadge = ({ currentStatus }: Props) => {
	const { variant, className } = useMemo(() => {
		const statusColor = getStatusColor(currentStatus)
		const isVariant = VARIANT_KEYWORDS.includes(statusColor)

		return {
			variant: (isVariant ? statusColor : 'default') as BadgeVariant,
			className: isVariant ? '' : statusColor,
		}
	}, [currentStatus])

	return (
		<Badge variant={variant} className={className}>
			{currentStatus}
		</Badge>
	)
}

export default ApplicationStatusBadge
