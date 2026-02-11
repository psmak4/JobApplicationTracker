import { useViewportSize } from '@/hooks/use-mobile'
import type { ApplicationSummary } from '@/types'
import { KanbanBoard } from './KanbanBoard'
import { TabletApplicationView } from './TabletApplicationView'

interface ResponsiveApplicationViewProps {
	applications: ApplicationSummary[]
}

export function ResponsiveApplicationView({ applications }: ResponsiveApplicationViewProps) {
	const viewportSize = useViewportSize()

	// Mobile and tablet both use collapsible sections view
	if (viewportSize === 'mobile' || viewportSize === 'tablet') {
		return <TabletApplicationView applications={applications} />
	}

	// Desktop - show kanban board
	return <KanbanBoard applications={applications} />
}
