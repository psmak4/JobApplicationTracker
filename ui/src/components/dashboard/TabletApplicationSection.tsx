import { ChevronDown } from 'lucide-react'
import React, { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApplicationStatusBadge } from '@/components/ApplicationStatusBadge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { APPLICATION_STATUS_OPTIONS, type KanbanColumn } from '@/constants'
import { useApplicationPrefetch } from '@/hooks/useApplications'
import { useUpdateStatusDynamic } from '@/hooks/useMutations'
import { safeLocalStorage } from '@/lib/utils'
import type { ApplicationStatus, ApplicationSummary } from '@/types'

const SECTION_HEADER_COLORS: Record<KanbanColumn, string> = {
	Applied: 'border-l-[#8BE9FD]',
	Interviewing: 'border-l-[#BD93F9]',
	'Offer Received': 'border-l-[#F1FA8C]',
	Closed: 'border-l-[#6272A4]',
}

interface TabletApplicationSectionProps {
	status: KanbanColumn
	applications: ApplicationSummary[]
	showStatusBadge?: boolean
}

export function TabletApplicationSection({
	status,
	applications,
	showStatusBadge = false,
}: TabletApplicationSectionProps) {
	const storageKey = `tabletSection_${status}`
	const [isExpanded, setIsExpanded] = useState(() => {
		const stored = safeLocalStorage.getItem(storageKey)
		return stored === null ? true : stored === 'true'
	})

	const toggleExpanded = useCallback(() => {
		setIsExpanded((prev) => {
			const next = !prev
			safeLocalStorage.setItem(storageKey, String(next))
			return next
		})
	}, [storageKey])

	const borderColor = SECTION_HEADER_COLORS[status] ?? 'border-l-muted'

	return (
		<div className={`border rounded-lg overflow-hidden border-l-4 ${borderColor}`}>
			<button
				type="button"
				className="w-full flex items-center justify-between p-3 hover:bg-accent/50 transition-colors"
				onClick={toggleExpanded}
			>
				<div className="flex items-center gap-2">
					<h3 className="font-outfit font-semibold text-sm">{status}</h3>
					<span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
						{applications.length}
					</span>
				</div>
				<ChevronDown
					className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`}
				/>
			</button>
			{isExpanded && (
				<div className="border-t divide-y">
					{applications.length === 0 ? (
						<div className="p-4 text-center text-sm text-muted-foreground">No applications</div>
					) : (
						applications.map((app) => (
							<TabletApplicationCard key={app.id} application={app} showStatusBadge={showStatusBadge} />
						))
					)}
				</div>
			)}
		</div>
	)
}

interface TabletApplicationCardProps {
	application: ApplicationSummary
	showStatusBadge?: boolean
}

const TabletApplicationCard = React.memo(function TabletApplicationCard({
	application,
	showStatusBadge = false,
}: TabletApplicationCardProps) {
	const navigate = useNavigate()
	const prefetch = useApplicationPrefetch()
	const statusMutation = useUpdateStatusDynamic()

	const handleStatusChange = useCallback(
		(newStatus: string) => {
			if (newStatus !== application.status) {
				statusMutation.mutate({
					applicationId: application.id,
					status: newStatus as ApplicationStatus,
				})
			}
		},
		[application.id, application.status, statusMutation],
	)

	return (
		<div
			className="p-3 hover:bg-accent/30 transition-colors cursor-pointer"
			onClick={() => navigate(`/applications/${application.id}`)}
			onMouseEnter={() => prefetch(application.id)}
		>
			<div className="flex items-center justify-between gap-3">
				<div className="flex-1 min-w-0">
					<p className="font-outfit font-bold text-sm truncate">{application.company}</p>
					<p className="text-xs text-muted-foreground truncate">{application.jobTitle}</p>
					{application.location && (
						<p className="text-xs text-muted-foreground truncate">{application.location}</p>
					)}
				</div>
				<div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
					{showStatusBadge && <ApplicationStatusBadge status={application.status} />}
					<Select value={application.status} onValueChange={(value) => value && handleStatusChange(value)}>
						<SelectTrigger className="h-8 w-auto min-w-[120px] text-xs">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{APPLICATION_STATUS_OPTIONS.map((opt) => (
								<SelectItem key={opt} value={opt}>
									{opt}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>
		</div>
	)
})
