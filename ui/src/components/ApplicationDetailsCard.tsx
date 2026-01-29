import { Briefcase, DollarSign, ExternalLink, FileText, MapPin, User } from 'lucide-react'
import type { Application } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

interface ApplicationDetailsCardProps {
	application: Application
}

/**
 * Read-only display of application details (job info, salary, location, notes, etc.)
 */
export function ApplicationDetailsCard({ application }: ApplicationDetailsCardProps) {
	return (
		<Card className="rounded-md">
			<CardHeader>
				<CardTitle>Application Details</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-1">
						<span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
							<Briefcase className="h-4 w-4" /> Job Title
						</span>
						<p className="font-medium">{application.jobTitle}</p>
					</div>
					<div className="space-y-1">
						<span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
							<Briefcase className="h-4 w-4" /> Company
						</span>
						<p className="font-medium">{application.company}</p>
					</div>
					{application.salary && (
						<div className="space-y-1">
							<span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
								<DollarSign className="h-4 w-4" /> Salary
							</span>
							<p>{application.salary}</p>
						</div>
					)}
					{application.workType && (
						<div className="space-y-1">
							<span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
								<MapPin className="h-4 w-4" /> Work Type
							</span>
							<p>{application.workType}</p>
						</div>
					)}
					{application.location && (
						<div className="space-y-1">
							<span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
								<MapPin className="h-4 w-4" /> Location
							</span>
							<p>{application.location}</p>
						</div>
					)}
					{application.contactInfo && (
						<div className="space-y-1">
							<span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
								<User className="h-4 w-4" /> Contact
							</span>
							<p>{application.contactInfo}</p>
						</div>
					)}
				</div>

				{application.jobDescriptionUrl && (
					<div className="space-y-1">
						<span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
							<ExternalLink className="h-4 w-4" /> Job Description
						</span>
						<a
							href={application.jobDescriptionUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary hover:underline break-all"
						>
							{application.jobDescriptionUrl}
						</a>
					</div>
				)}

				{application.notes && (
					<div className="space-y-1">
						<span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
							<FileText className="h-4 w-4" /> Notes
						</span>
						<div className="p-4 bg-muted/30 rounded-lg whitespace-pre-wrap text-sm">
							{application.notes}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	)
}
