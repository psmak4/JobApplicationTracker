import { useDroppable } from '@dnd-kit/core'
import type { KanbanColumn as KanbanColumnType } from '@/constants'
import type { ApplicationSummary } from '@/types'
import { KanbanCard } from './KanbanCard'

interface KanbanColumnProps {
	id: KanbanColumnType
	title: string
	applications: ApplicationSummary[]
	showStatusBadge?: boolean
}

const COLUMN_HEADER_COLORS: Record<KanbanColumnType, string> = {
	Applied: 'bg-[#8BE9FD]/20 text-[#036A96] dark:text-[#8BE9FD]',
	Interviewing: 'bg-[#BD93F9]/20 text-[#644AC9] dark:text-[#BD93F9]',
	'Offer Received': 'bg-[#F1FA8C]/20 text-[#8B7E00] dark:text-[#F1FA8C]',
	Closed: 'bg-[#6272A4]/20 text-[#6272A4] dark:text-[#9CA3D0]',
}

export function KanbanColumn({ id, title, applications, showStatusBadge = false }: KanbanColumnProps) {
	const { setNodeRef, isOver } = useDroppable({ id })

	return (
		<div
			ref={setNodeRef}
			className={`flex flex-col rounded-lg border transition-colors ${
				isOver ? 'border-primary/50 bg-primary/5' : 'border-border bg-muted/30'
			}`}
		>
			<div className={`px-3 py-2 rounded-t-lg ${COLUMN_HEADER_COLORS[id]}`}>
				<div className="flex items-center justify-between">
					<h3 className="font-outfit font-semibold text-sm">{title}</h3>
					<span className="text-xs font-medium opacity-70">{applications.length}</span>
				</div>
			</div>
			<div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-280px)]">
				{applications.map((app) => (
					<KanbanCard key={app.id} application={app} showStatusBadge={showStatusBadge} />
				))}
				{applications.length === 0 && (
					<div className="flex items-center justify-center h-20 text-xs text-muted-foreground opacity-50">
						Drop here
					</div>
				)}
			</div>
		</div>
	)
}
