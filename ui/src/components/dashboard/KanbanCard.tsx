import { useDraggable } from '@dnd-kit/core'
import { MapPin } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ApplicationStatusBadge } from '@/components/ApplicationStatusBadge'
import { useApplicationPrefetch } from '@/hooks/useApplications'
import type { ApplicationSummary } from '@/types'

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
	const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
		id: application.id,
	})

	return (
		<div
			ref={setNodeRef}
			{...listeners}
			{...attributes}
			className={`p-3 rounded-md border cursor-grab active:cursor-grabbing transition-all bg-card hover:bg-accent/50 hover:border-primary/30 ${
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
			</div>
		</div>
	)
})
