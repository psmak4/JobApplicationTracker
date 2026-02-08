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
			return 'bg-[#8BE9FD]/15 text-[#036A96] hover:bg-[#8BE9FD]/25 border-transparent dark:bg-[#8BE9FD]/20 dark:text-[#8BE9FD]'
		case 'Interviewing':
			return 'bg-[#BD93F9]/15 text-[#644AC9] hover:bg-[#BD93F9]/25 border-transparent dark:bg-[#BD93F9]/20 dark:text-[#BD93F9]'
		case 'Offer Received':
			return 'bg-[#50FA7B]/15 text-[#14710A] hover:bg-[#50FA7B]/25 border-transparent dark:bg-[#50FA7B]/20 dark:text-[#50FA7B]'
		case 'Rejected':
			return 'bg-[#FF5555]/15 text-[#CB3A2A] hover:bg-[#FF5555]/25 border-transparent dark:bg-[#FF5555]/20 dark:text-[#FF5555]'
		case 'Withdrawn':
			return 'bg-[#6272A4]/15 text-[#6C664B] hover:bg-[#6272A4]/25 border-transparent dark:bg-[#6272A4]/20 dark:text-[#6272A4]'
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
