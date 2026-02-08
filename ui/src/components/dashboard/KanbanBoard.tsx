import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { useCallback, useMemo, useState } from 'react'
import { APPLICATION_STATUS_OPTIONS } from '@/constants'
import { useDashboardFilters } from '@/hooks/useDashboardFilters'
import type { ApplicationStatus, ApplicationSummary } from '@/types'
import { KanbanCard } from './KanbanCard'
import { KanbanColumn } from './KanbanColumn'

interface KanbanBoardProps {
	applications: ApplicationSummary[]
	onNavigate: (id: string) => void
	onPrefetch: (id: string) => void
	onStatusChange: (applicationId: string, newStatus: ApplicationStatus) => void
}

export function KanbanBoard({ applications, onNavigate, onPrefetch, onStatusChange }: KanbanBoardProps) {
	const { getCurrentStatus } = useDashboardFilters()
	const [activeApplication, setActiveApplication] = useState<ApplicationSummary | null>(null)

	// Group applications by status
	const applicationsByStatus = useMemo(() => {
		const grouped: Record<ApplicationStatus, ApplicationSummary[]> = {
			Applied: [],
			Interviewing: [],
			'Offer Received': [],
			Rejected: [],
			Withdrawn: [],
		}

		for (const app of applications) {
			const status = getCurrentStatus(app)
			if (status in grouped) {
				grouped[status as ApplicationStatus].push(app)
			}
		}

		return grouped
	}, [applications, getCurrentStatus])

	// Configure pointer sensor with activation constraint to prevent accidental drags
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
	)

	const handleDragStart = useCallback((event: DragStartEvent) => {
		const { active } = event
		const application = active.data.current?.application as ApplicationSummary | undefined
		if (application) {
			setActiveApplication(application)
		}
	}, [])

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event
			setActiveApplication(null)

			if (!over) return

			const applicationId = active.id as string
			const newStatus = over.id as ApplicationStatus
			const application = applications.find((app) => app.id === applicationId)

			if (!application) return

			const currentStatus = getCurrentStatus(application)
			if (currentStatus === newStatus) return

			// Trigger status update via callback
			onStatusChange(applicationId, newStatus)
		},
		[applications, getCurrentStatus, onStatusChange],
	)

	return (
		<DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
			<div className="overflow-x-auto pb-4 -mx-6 px-6">
				<div className="flex gap-4 min-w-max">
					{APPLICATION_STATUS_OPTIONS.map((status) => (
						<KanbanColumn
							key={status}
							status={status}
							applications={applicationsByStatus[status]}
							onNavigate={onNavigate}
							onPrefetch={onPrefetch}
						/>
					))}
				</div>
			</div>

			{/* Drag Overlay - shows the card being dragged */}
			<DragOverlay>
				{activeApplication && (
					<div className="opacity-90 rotate-2">
						<KanbanCard application={activeApplication} onNavigate={() => {}} onPrefetch={() => {}} />
					</div>
				)}
			</DragOverlay>
		</DndContext>
	)
}
