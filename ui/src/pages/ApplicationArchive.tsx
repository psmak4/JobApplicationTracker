import { ArchiveRestore, Building2, CalendarIcon, MapPin } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LoadingFallback } from '@/components/LoadingSpinner'
import PageHeader from '@/components/PageHeader'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useArchivedApplications } from '@/hooks/useApplications'
import { useRestoreApplication } from '@/hooks/useMutations'

export default function ApplicationArchive() {
	const { data: applications, isLoading, isError } = useArchivedApplications()
	const restoreApplicationMutation = useRestoreApplication()
	const [applicationToRestore, setApplicationToRestore] = useState<string | null>(null)

	const confirmRestore = async () => {
		if (!applicationToRestore) return

		try {
			await restoreApplicationMutation.mutateAsync(applicationToRestore)
		} finally {
			setApplicationToRestore(null)
		}
	}

	if (isLoading) return <LoadingFallback />

	if (isError) {
		return (
			<div className="p-8 text-center">
				<h2 className="text-xl font-semibold text-destructive mb-2">Error loading archived applications</h2>
				<p className="text-muted-foreground">Please try refreshing the page.</p>
			</div>
		)
	}

	const appToRestore = applications?.find((app) => app.id === applicationToRestore)

	return (
		<div className="space-y-6 p-6 pb-20 md:pb-6 animate-in fade-in duration-500">
			<PageHeader title="Archived Applications" subtitle="View and restore previously archived applications." />

			{!applications || applications.length === 0 ? (
				<Card className="text-center py-12">
					<CardHeader>
						<div className="mx-auto bg-muted rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4">
							<ArchiveRestore className="h-8 w-8 text-muted-foreground" />
						</div>
						<CardTitle>No archived applications</CardTitle>
						<CardDescription>
							Archived applications will appear here. You can archive an application from its details
							page.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button variant="outline" render={<Link to="/pipeline">Go to Pipeline</Link>} />
					</CardContent>
				</Card>
			) : (
				<div className="rounded-md border bg-card">
					<div className="w-full overflow-auto">
						<table className="w-full caption-bottom text-sm">
							<thead className="[&_tr]:border-b">
								<tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
									<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
										Company
									</th>
									<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
										Job Title
									</th>
									<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 hidden md:table-cell">
										Details
									</th>
									<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
										Archived Date
									</th>
									<th className="h-12 px-4 align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 text-right">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="[&_tr:last-child]:border-0">
								{applications.map((app) => (
									<tr
										key={app.id}
										className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
									>
										<td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium">
											<div className="flex items-center gap-2">
												<div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold text-xs ring-1 ring-primary/20">
													{app.company.substring(0, 2).toUpperCase()}
												</div>
												{app.company}
											</div>
										</td>
										<td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
											{app.jobTitle}
										</td>
										<td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 hidden md:table-cell">
											<div className="flex flex-col gap-1 text-xs text-muted-foreground">
												{app.location && (
													<div className="flex items-center gap-1">
														<MapPin className="h-3 w-3" /> {app.location}
													</div>
												)}
												{app.workType && (
													<div className="flex items-center gap-1">
														<Building2 className="h-3 w-3" /> {app.workType}
													</div>
												)}
											</div>
										</td>
										<td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
											<div className="flex flex-col gap-1">
												<div className="flex items-center gap-2 text-sm text-muted-foreground">
													<CalendarIcon className="h-3 w-3" />
													{app.archivedAt
														? new Intl.DateTimeFormat('en-US', {
																month: 'short',
																day: 'numeric',
																year: 'numeric',
																dayPeriod: undefined,
															}).format(new Date(app.archivedAt))
														: 'Unknown'}
												</div>
												{app.currentStatus && (
													<Badge
														variant="outline"
														className="w-fit text-[10px] px-1 py-0 h-5"
													>
														Was: {app.currentStatus}
													</Badge>
												)}
											</div>
										</td>
										<td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => setApplicationToRestore(app.id)}
											>
												<ArchiveRestore className="h-4 w-4 mr-2" />
												Restore
											</Button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			<AlertDialog open={!!applicationToRestore} onOpenChange={(open) => !open && setApplicationToRestore(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Restore Application?</AlertDialogTitle>
						<AlertDialogDescription>
							This will move <strong>{appToRestore?.company}</strong> back to your active pipeline.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={restoreApplicationMutation.isPending}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={(e) => {
								e.preventDefault()
								confirmRestore()
							}}
							disabled={restoreApplicationMutation.isPending}
						>
							{restoreApplicationMutation.isPending ? 'Restoring...' : 'Restore Application'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
