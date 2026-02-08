import { useViewportSize } from '@/hooks/use-mobile'
import type { ApplicationStatus, ApplicationSummary } from '@/types'
import { KanbanBoard } from './KanbanBoard'
import { TabletApplicationView } from './TabletApplicationView'

interface ResponsiveApplicationViewProps {
	applications: ApplicationSummary[]
	onNavigate: (id: string) => void
	onPrefetch: (id: string) => void
	onStatusChange: (applicationId: string, newStatus: ApplicationStatus) => void
}

export function ResponsiveApplicationView({
	applications,
	onNavigate,
	onPrefetch,
	onStatusChange,
}: ResponsiveApplicationViewProps) {
	const viewportSize = useViewportSize()

	// Mobile and tablet both use collapsible sections view
	if (viewportSize === 'mobile' || viewportSize === 'tablet') {
		return (
			<TabletApplicationView
				applications={applications}
				onNavigate={onNavigate}
				onPrefetch={onPrefetch}
				onStatusChange={onStatusChange}
			/>
		)
	}

	// Desktop - show kanban board
	return (
		<KanbanBoard
			applications={applications}
			onNavigate={onNavigate}
			onPrefetch={onPrefetch}
			onStatusChange={onStatusChange}
		/>
	)
}
