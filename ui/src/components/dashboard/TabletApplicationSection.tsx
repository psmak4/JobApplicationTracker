import { Briefcase, ChevronDown, ChevronRight, MapPin } from 'lucide-react'
import { useCallback, useState } from 'react'
import ApplicationStatusBadge from '@/components/ApplicationStatusBadge'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { APPLICATION_STATUS_OPTIONS } from '@/constants'
import { getCurrentStatus, getLastStatusDate } from '@/lib/application-helpers'
import { formatDisplayDate, safeLocalStorage } from '@/lib/utils'
import type { ApplicationStatus, ApplicationSummary } from '@/types'

const STORAGE_KEY = 'tablet-section-collapse-state'

interface TabletApplicationSectionProps {
	status: ApplicationStatus
	applications: ApplicationSummary[]
	onNavigate: (id: string) => void
	onPrefetch: (id: string) => void
	onStatusChange: (applicationId: string, newStatus: ApplicationStatus) => void
}

function getStoredCollapseState(): Record<string, boolean> {
	const stored = safeLocalStorage.getItem(STORAGE_KEY)
	if (stored) {
		try {
			return JSON.parse(stored)
		} catch {
			return {}
		}
	}
	return {}
}

function setStoredCollapseState(state: Record<string, boolean>) {
	safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

// Inline card component for tablet/mobile view
function TabletApplicationCard({
	application,
	onNavigate,
	onPrefetch,
	onStatusChange,
}: {
	application: ApplicationSummary
	onNavigate: (id: string) => void
	onPrefetch: (id: string) => void
	onStatusChange: (applicationId: string, newStatus: ApplicationStatus) => void
}) {
	const currentStatus = getCurrentStatus(application)
	const lastStatusDate = getLastStatusDate(application)

	const handleStatusChange = (newStatus: string | null) => {
		if (newStatus && newStatus !== currentStatus) {
			onStatusChange(application.id, newStatus as ApplicationStatus)
		}
	}

	return (
		<Card className="bg-card" onMouseEnter={() => onPrefetch(application.id)}>
			<CardContent className="p-4">
				<div className="flex items-start justify-between gap-3">
					{/* Main content - clickable */}
					<div className="flex-1 min-w-0 cursor-pointer" onClick={() => onNavigate(application.id)}>
						{/* Company & Job Title */}
						<div className="font-medium text-base leading-tight hover:text-primary transition-colors">
							{application.company}
						</div>
						<div className="text-sm mt-0.5">{application.jobTitle}</div>

						{/* Location & Work Type */}
						{(application.location || application.workType) && (
							<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-2">
								{application.location && (
									<span className="flex items-center gap-1">
										<MapPin className="h-3 w-3 shrink-0" />
										<span className="truncate">{application.location}</span>
									</span>
								)}
								{application.workType && (
									<span className="flex items-center gap-1">
										<Briefcase className="h-3 w-3 shrink-0" />
										{application.workType}
									</span>
								)}
							</div>
						)}

						{/* Last update date */}
						<div className="text-xs text-muted-foreground mt-2">
							Updated {formatDisplayDate(lastStatusDate)}
						</div>
					</div>

					{/* Status controls - always visible */}
					<div className="flex flex-col items-end gap-2 shrink-0">
						{/* Current status badge */}
						<ApplicationStatusBadge currentStatus={currentStatus} />

						{/* Status dropdown - min 44px touch target */}
						<Select value={currentStatus} onValueChange={handleStatusChange}>
							<SelectTrigger className="h-11 min-w-[140px] text-sm">
								<SelectValue placeholder="Change status" />
							</SelectTrigger>
							<SelectContent>
								{APPLICATION_STATUS_OPTIONS.map((status) => (
									<SelectItem key={status} value={status} className="min-h-[44px]">
										{status}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

export function TabletApplicationSection({
	status,
	applications,
	onNavigate,
	onPrefetch,
	onStatusChange,
}: TabletApplicationSectionProps) {
	// Initialize from localStorage, default to expanded
	const [isOpen, setIsOpen] = useState(() => {
		const stored = getStoredCollapseState()
		return stored[status] !== false // Default to true (expanded)
	})

	// Persist collapse state
	const handleOpenChange = useCallback(
		(open: boolean) => {
			setIsOpen(open)
			const current = getStoredCollapseState()
			current[status] = open
			setStoredCollapseState(current)
		},
		[status],
	)

	return (
		<Collapsible open={isOpen} onOpenChange={handleOpenChange} className="border rounded-lg">
			<CollapsibleTrigger className="w-full flex justify-between items-center h-14 px-4 rounded-b-none hover:bg-muted/50">
				<div className="flex items-center gap-3">
					{isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
					<span className="font-medium text-base">{status}</span>
					<Badge variant="secondary" className="ml-1">
						{applications.length}
					</Badge>
				</div>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<div className="p-3 space-y-2 border-t bg-muted/20">
					{applications.length === 0 ? (
						<div className="text-center py-4 text-sm text-muted-foreground">No applications</div>
					) : (
						applications.map((app) => (
							<TabletApplicationCard
								key={app.id}
								application={app}
								onNavigate={onNavigate}
								onPrefetch={onPrefetch}
								onStatusChange={onStatusChange}
							/>
						))
					)}
				</div>
			</CollapsibleContent>
		</Collapsible>
	)
}
