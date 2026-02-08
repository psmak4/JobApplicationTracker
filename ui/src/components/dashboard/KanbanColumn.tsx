import { useDroppable } from '@dnd-kit/core'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ApplicationStatus, ApplicationSummary } from '@/types'
import { KanbanCard } from './KanbanCard'

interface KanbanColumnProps {
	status: ApplicationStatus
	applications: ApplicationSummary[]
	onNavigate: (id: string) => void
	onPrefetch: (id: string) => void
}

export function KanbanColumn({ status, applications, onNavigate, onPrefetch }: KanbanColumnProps) {
	const { setNodeRef, isOver } = useDroppable({
		id: status,
	})

	return (
		<div className="flex flex-col min-w-[280px] max-w-[280px]">
			{/* Column Header */}
			<div className="flex items-center gap-2 px-2 py-3 border-b">
				<h3 className="font-medium text-sm">{status}</h3>
				<Badge variant="secondary" className="text-xs">
					{applications.length}
				</Badge>
			</div>

			{/* Column Content */}
			<div
				ref={setNodeRef}
				className={cn(
					'flex-1 p-2 space-y-2 min-h-[200px] rounded-b-lg transition-colors',
					isOver && 'bg-primary/5 ring-2 ring-primary/20 ring-inset',
				)}
			>
				{applications.map((app) => (
					<KanbanCard key={app.id} application={app} onNavigate={onNavigate} onPrefetch={onPrefetch} />
				))}

				{applications.length === 0 && (
					<div className="flex items-center justify-center h-20 text-xs text-muted-foreground">
						No applications
					</div>
				)}
			</div>
		</div>
	)
}
