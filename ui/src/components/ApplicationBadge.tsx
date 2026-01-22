import type { ApplicationStatus } from '@/types'
import { Badge } from './ui/badge'

interface Props {
	currentStatus: ApplicationStatus | 'Unknown'
}

const ApplicationStatusBadge = ({ currentStatus }: Props) => {
	const getStatusColor = (status: ApplicationStatus | 'Unknown') => {
		switch (status) {
			case 'Offer':
				return 'bg-green-100 text-green-800 hover:bg-green-100/80 border-transparent dark:bg-green-900/30 dark:text-green-400'
			case 'Rejected':
				return 'destructive'
			case 'Withdrawn':
				return 'secondary'
			default:
				return 'outline'
		}
	}

	return (
		<Badge
			variant={getStatusColor(currentStatus) as 'default' | 'destructive' | 'secondary' | 'outline'}
			className={
				getStatusColor(currentStatus) !== 'destructive' &&
				getStatusColor(currentStatus) !== 'secondary' &&
				getStatusColor(currentStatus) !== 'outline'
					? getStatusColor(currentStatus)
					: ''
			}
		>
			{currentStatus}
		</Badge>
	)
}

export default ApplicationStatusBadge
