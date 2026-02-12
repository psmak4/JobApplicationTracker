import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import type { ApplicationStatus } from '@/types'

interface OfferActionModalProps {
	open: boolean
	action: 'accept' | 'decline' | null
	companyName: string
	onConfirm: (status: ApplicationStatus) => void
	onCancel: () => void
}

/**
 * Modal shown when a user clicks Accept or Decline on an "Offer Received" application.
 * Prompts the user to confirm their action before updating the status.
 */
export function OfferActionModal({ open, action, companyName, onConfirm, onCancel }: OfferActionModalProps) {
	const isAccept = action === 'accept'
	const title = isAccept ? 'Accept Offer?' : 'Decline Offer?'
	const description = isAccept
		? `Are you sure you want to accept the offer from ${companyName}?`
		: `Are you sure you want to decline the offer from ${companyName}?`
	const confirmButtonVariant = isAccept ? 'default' : 'secondary'
	const targetStatus: ApplicationStatus = isAccept ? 'Offer Accepted' : 'Offer Declined'

	return (
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<DialogFooter className="gap-2 sm:gap-0">
					<Button variant="ghost" onClick={onCancel}>
						Cancel
					</Button>
					<Button variant={confirmButtonVariant} onClick={() => onConfirm(targetStatus)}>
						{isAccept ? 'Accept Offer' : 'Decline Offer'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
