import { ArchiveRestore, CalendarIcon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ApplicationStatusBadge } from '@/components/ApplicationStatusBadge'
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
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useArchivedApplications } from '@/hooks/useApplications'
import { useRestoreApplication } from '@/hooks/useMutations'
import { formatDate } from '@/lib/utils'

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
		<div className="space-y-6">
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
				<div className="rounded-md border bg-card shadow-lg">
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
										<td className="p-4 align-middle font-medium">{app.company}</td>
										<td className="p-4 align-middle">{app.jobTitle}</td>
										<td className="p-4 align-middle hidden md:table-cell">
											<ApplicationStatusBadge status={app.status} />
										</td>
										<td className="p-4 align-middle">
											<div className="flex flex-col gap-1">
												<div className="flex items-center gap-2 text-sm text-muted-foreground">
													<CalendarIcon className="h-3 w-3" />
													{app.archivedAt ? formatDate(app.archivedAt, 'short') : 'Unknown'}
												</div>
											</div>
										</td>
										<td className="p-4 align-middle text-right">
											<Button
												variant="ghost"
												size="sm"
												className="bg-green-600/10 text-green-600 hover:bg-green-600/20 focus-visible:ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:hover:bg-green-400/20 dark:focus-visible:ring-green-400/40"
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
