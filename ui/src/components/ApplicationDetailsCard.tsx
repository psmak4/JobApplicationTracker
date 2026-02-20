import { Briefcase, Building2, Calendar, Clock, DollarSign, ExternalLink, Laptop, MapPin, User } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Application } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Separator } from './ui/separator'

interface ApplicationDetailsCardProps {
	application: Application
}

/**
 * Read-only display of application details with icons and visual hierarchy
 */
export function ApplicationDetailsCard({ application }: ApplicationDetailsCardProps) {
	return (
		<Card className="shadow-xl">
			<CardHeader className="pb-3">
				<CardTitle className="text-lg font-semibold">Application Details</CardTitle>
			</CardHeader>
			<CardContent className="space-y-5">
				{/* Primary info */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
					<DetailField icon={Briefcase} label="Job Title" value={application.jobTitle} />
					<DetailField icon={Building2} label="Company" value={application.company} />
				</div>

				{/* Secondary info */}
				{(application.location || application.salary || application.workType || application.contactInfo) && (
					<>
						<Separator />
						<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
							{application.location && (
								<DetailField icon={MapPin} label="Location" value={application.location} />
							)}
							{application.salary && (
								<DetailField icon={DollarSign} label="Salary" value={application.salary} />
							)}
							{application.workType && (
								<DetailField icon={Laptop} label="Work Type" value={application.workType} />
							)}
							{application.contactInfo && (
								<DetailField icon={User} label="Contact" value={application.contactInfo} />
							)}
						</div>
					</>
				)}

				{/* Dates */}
				<Separator />
				<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
					<DetailField
						icon={Calendar}
						label="Date Applied"
						value={formatDate(application.appliedAt, 'long')}
					/>
					<DetailField
						icon={Clock}
						label="Last Updated"
						value={formatDate(application.statusUpdatedAt, 'long')}
					/>
				</div>

				{/* Job Description URL */}
				{application.jobDescriptionUrl && (
					<>
						<Separator />
						<div>
							<a
								href={application.jobDescriptionUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border bg-muted/50 hover:bg-muted text-sm font-medium transition-colors group"
							>
								<ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
								<span className="text-muted-foreground group-hover:text-foreground transition-colors">
									View Job Description
								</span>
								<span className="text-xs text-muted-foreground/60 truncate max-w-[200px]">
									{new URL(application.jobDescriptionUrl).hostname}
								</span>
							</a>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	)
}

/** Individual detail field with icon */
function DetailField({
	icon: Icon,
	label,
	value,
}: {
	icon: React.ComponentType<{ className?: string }>
	label: string
	value: string
}) {
	return (
		<div className="flex items-start gap-3">
			<div className="mt-0.5 p-1.5 rounded-md bg-muted/50">
				<Icon className="h-4 w-4 text-muted-foreground" />
			</div>
			<div className="space-y-0.5 min-w-0">
				<span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
				<p className="font-medium text-sm">{value}</p>
			</div>
		</div>
	)
}
