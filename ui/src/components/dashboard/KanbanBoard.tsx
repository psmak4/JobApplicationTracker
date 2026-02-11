import {
	DndContext,
	type DragEndEvent,
	DragOverlay,
	type DragStartEvent,
	PointerSensor,
	closestCenter,
	useSensor,
	useSensors,
} from '@dnd-kit/core'
import React, { useCallback, useMemo, useState } from 'react'
import { KANBAN_COLUMNS, type KanbanColumn } from '@/constants'
import { useUpdateStatusDynamic } from '@/hooks/useMutations'
import { getKanbanColumn } from '@/lib/application-helpers'
import type { ApplicationStatus, ApplicationSummary } from '@/types'
import { ClosedStatusModal } from './ClosedStatusModal'
import { KanbanCard } from './KanbanCard'
import { KanbanColumn as KanbanColumnComponent } from './KanbanColumn'

interface KanbanBoardProps {
	applications: ApplicationSummary[]
}

export const KanbanBoard = React.memo(function KanbanBoard({ applications }: KanbanBoardProps) {
	const statusMutation = useUpdateStatusDynamic()
	const [activeId, setActiveId] = useState<string | null>(null)
	const [pendingClosedDrop, setPendingClosedDrop] = useState<{
		applicationId: string
	} | null>(null)

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
	)

	// Group applications by kanban column
	const groupedApplications = useMemo(() => {
		const groups: Record<KanbanColumn, ApplicationSummary[]> = {
			Applied: [],
			Interviewing: [],
			'Offer Received': [],
			Closed: [],
		}
		for (const app of applications) {
			const column = getKanbanColumn(app.status)
			if (column in groups) {
				groups[column as KanbanColumn].push(app)
			}
		}
		return groups
	}, [applications])

	const activeApplication = useMemo(() => applications.find((app) => app.id === activeId), [applications, activeId])

	const handleDragStart = useCallback((event: DragStartEvent) => {
		setActiveId(event.active.id as string)
	}, [])

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			setActiveId(null)
			const { active, over } = event
			if (!over) return

			const applicationId = active.id as string
			const targetColumn = over.id as KanbanColumn

			// Find the application
			const app = applications.find((a) => a.id === applicationId)
			if (!app) return

			// Determine current column
			const currentColumn = getKanbanColumn(app.status)
			if (currentColumn === targetColumn) return

			if (targetColumn === 'Closed') {
				// Show modal to select terminal status
				setPendingClosedDrop({ applicationId })
			} else {
				// Direct status update for non-closed columns
				statusMutation.mutate({
					applicationId,
					status: targetColumn as ApplicationStatus,
				})
			}
		},
		[applications, statusMutation],
	)

	const handleClosedStatusConfirm = useCallback(
		(status: ApplicationStatus) => {
			if (pendingClosedDrop) {
				statusMutation.mutate({
					applicationId: pendingClosedDrop.applicationId,
					status,
				})
			}
			setPendingClosedDrop(null)
		},
		[pendingClosedDrop, statusMutation],
	)

	const handleClosedStatusCancel = useCallback(() => {
		setPendingClosedDrop(null)
	}, [])

	return (
		<>
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
			>
				<div className="grid grid-cols-4 gap-4 min-h-[400px]">
					{KANBAN_COLUMNS.map((column) => (
						<KanbanColumnComponent
							key={column}
							id={column}
							title={column}
							applications={groupedApplications[column]}
							showStatusBadge={column === 'Closed'}
						/>
					))}
				</div>
				<DragOverlay>
					{activeApplication ? <KanbanCard application={activeApplication} isOverlay /> : null}
				</DragOverlay>
			</DndContext>
			<ClosedStatusModal
				open={!!pendingClosedDrop}
				onConfirm={handleClosedStatusConfirm}
				onCancel={handleClosedStatusCancel}
			/>
		</>
	)
})
