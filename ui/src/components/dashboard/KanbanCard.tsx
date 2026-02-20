import { useDraggable } from '@dnd-kit/core'
import { MapPin } from 'lucide-react'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApplicationStatusBadge } from '@/components/ApplicationStatusBadge'
import { Button } from '@/components/ui/button'
import { useApplicationPrefetch } from '@/hooks/useApplications'
import { useUpdateStatusDynamic } from '@/hooks/useMutations'
import type { ApplicationStatus, ApplicationSummary } from '@/types'
import { OfferActionModal } from './OfferActionModal'

interface KanbanCardProps {
	application: ApplicationSummary
	isOverlay?: boolean
	showStatusBadge?: boolean
}

export const KanbanCard = React.memo(function KanbanCard({
	application,
	isOverlay = false,
	showStatusBadge = false,
}: KanbanCardProps) {
	const navigate = useNavigate()
	const prefetch = useApplicationPrefetch()
	const statusMutation = useUpdateStatusDynamic()
	const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
		id: application.id,
	})

	const [pendingAction, setPendingAction] = useState<'accept' | 'decline' | null>(null)

	const isOfferReceived = application.status === 'Offer Received'

	const handleAcceptClick = (e: React.MouseEvent) => {
		e.stopPropagation()
		setPendingAction('accept')
	}

	const handleDeclineClick = (e: React.MouseEvent) => {
		e.stopPropagation()
		setPendingAction('decline')
	}

	const handleConfirm = (status: ApplicationStatus) => {
		statusMutation.mutate({
			applicationId: application.id,
			status,
		})
		setPendingAction(null)
	}

	const handleCancel = () => {
		setPendingAction(null)
	}

	return (
		<>
			<div
				ref={setNodeRef}
				{...listeners}
				{...attributes}
				className={`p-3 card-interactive cursor-grab active:cursor-grabbing hover:border-primary/30 ${
					isDragging ? 'opacity-50' : ''
				} ${isOverlay ? 'shadow-lg ring-2 ring-primary/20' : ''}`}
				onClick={(e) => {
					if (!isDragging) {
						e.preventDefault()
						navigate(`/applications/${application.id}`)
					}
				}}
				onMouseEnter={() => {
					prefetch(application.id)
				}}
			>
				<div className="space-y-1.5">
					<p className="font-outfit font-bold text-sm leading-tight">{application.company}</p>
					<p className="text-xs text-muted-foreground leading-snug">{application.jobTitle}</p>
					{(application.location || application.workType) && (
						<div className="flex items-center gap-1 text-xs text-muted-foreground">
							<MapPin className="h-3 w-3 shrink-0" />
							<span className="truncate">
								{[application.location, application.workType].filter(Boolean).join(' · ')}
							</span>
						</div>
					)}
					{showStatusBadge && (
						<div className="pt-1">
							<ApplicationStatusBadge status={application.status} />
						</div>
					)}

					{/* Accept/Decline buttons for Offer Received status */}
					{isOfferReceived && !isOverlay && (
						<div className="flex gap-2 pt-2" onPointerDown={(e) => e.stopPropagation()}>
							<Button
								size="sm"
								variant="default"
								className="flex-1 h-8 text-xs"
								onClick={handleAcceptClick}
								aria-label="Accept offer"
							>
								Accept
							</Button>
							<Button
								size="sm"
								variant="secondary"
								className="flex-1 h-8 text-xs"
								onClick={handleDeclineClick}
								aria-label="Decline offer"
							>
								Decline
							</Button>
						</div>
					)}
				</div>
			</div>

			<OfferActionModal
				open={!!pendingAction}
				action={pendingAction}
				companyName={application.company}
				onConfirm={handleConfirm}
				onCancel={handleCancel}
			/>
		</>
	)
})
