import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ApplicationSummary } from '@/types'

interface KanbanCardProps {
	application: ApplicationSummary
	onNavigate: (id: string) => void
	onPrefetch: (id: string) => void
}

function KanbanCardComponent({ application, onNavigate, onPrefetch }: KanbanCardProps) {
	const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
		id: application.id,
		data: { application },
	})

	const style = {
		transform: CSS.Translate.toString(transform),
	}

	return (
		<Card
			ref={setNodeRef}
			style={style}
			className={cn(
				'bg-card cursor-grab active:cursor-grabbing transition-shadow select-none touch-none',
				isDragging && 'opacity-50 shadow-lg ring-2 ring-primary',
			)}
			onMouseEnter={() => onPrefetch(application.id)}
			{...listeners}
			{...attributes}
		>
			<CardContent className="py-0">
				{/* Company & Job Title */}
				<div
					className="cursor-pointer"
					onClick={(e) => {
						e.stopPropagation()
						onNavigate(application.id)
					}}
				>
					<div className="font-medium text-base leading-tight hover:text-primary transition-colors">
						{application.company}
					</div>
					<div className="text-sm truncate">{application.jobTitle}</div>
				</div>

				{/* Location & Work Type */}
				{(application.location || application.workType) && (
					<div className="flex flex-col gap-0.5 text-xs text-muted-foreground pt-1">
						{application.location && <span>{application.location}</span>}
						{application.workType && <span>{application.workType}</span>}
					</div>
				)}
			</CardContent>
		</Card>
	)
}

export const KanbanCard = React.memo(KanbanCardComponent)
