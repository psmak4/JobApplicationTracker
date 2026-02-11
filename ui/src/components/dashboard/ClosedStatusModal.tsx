import { ApplicationStatusBadge } from '@/components/ApplicationStatusBadge'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { CLOSED_STATUSES } from '@/constants'
import type { ApplicationStatus } from '@/types'

interface ClosedStatusModalProps {
	open: boolean
	onConfirm: (status: ApplicationStatus) => void
	onCancel: () => void
}

/**
 * Modal shown when a user drops an application into the "Closed" kanban column.
 * Prompts the user to select a specific terminal status.
 */
export function ClosedStatusModal({ open, onConfirm, onCancel }: ClosedStatusModalProps) {
	return (
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
			<DialogContent className="sm:max-w-[380px]">
				<DialogHeader>
					<DialogTitle>Select Final Status</DialogTitle>
					<DialogDescription>Choose the reason for closing this application.</DialogDescription>
				</DialogHeader>
				<div className="grid grid-cols-1 gap-2 py-4">
					{CLOSED_STATUSES.map((status) => (
						<Button
							key={status}
							variant="outline"
							className="justify-start h-11 px-4 gap-3 hover:bg-accent"
							onClick={() => onConfirm(status)}
						>
							<ApplicationStatusBadge status={status} />
						</Button>
					))}
				</div>
				<DialogFooter>
					<Button variant="ghost" onClick={onCancel}>
						Cancel
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
