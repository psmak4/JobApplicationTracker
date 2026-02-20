import { zodResolver } from '@hookform/resolvers/zod'
import { Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ApplicationFormFields } from '@/components/ApplicationFormFields'
import PageHeader from '@/components/PageHeader'
import { QueryError, QueryLoading } from '@/components/QueryState'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useApplication, useDeleteApplication } from '@/hooks/useApplications'
import { useUpdateApplication } from '@/hooks/useMutations'
import { type ApplicationFormValues, applicationSchema } from '@/lib/schemas'
import type { ApplicationStatus } from '@/types'

export default function ApplicationEdit() {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()

	// All hooks must be called before any conditional returns
	const { data: application, isLoading } = useApplication(id ?? '')
	const updateMutation = useUpdateApplication(id ?? '')
	const deleteApplicationMutation = useDeleteApplication()

	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		control,
		formState: { errors, isDirty, isSubmitting },
	} = useForm<ApplicationFormValues>({
		resolver: zodResolver(applicationSchema),
		defaultValues: {
			company: '',
			jobTitle: '',
			jobDescriptionUrl: '',
			salary: '',
			location: '',
			workType: 'Remote',
			contactInfo: '',
			status: 'Applied',
			appliedAt: new Date().toISOString().split('T')[0],
		},
	})

	useEffect(() => {
		if (application) {
			reset({
				company: application.company,
				jobTitle: application.jobTitle,
				jobDescriptionUrl: application.jobDescriptionUrl || '',
				salary: application.salary || '',
				location: application.location || '',
				workType: application.workType,
				contactInfo: application.contactInfo || '',
				status: application.status,
				appliedAt: application.appliedAt
					? new Date(application.appliedAt).toISOString().split('T')[0]
					: new Date().toISOString().split('T')[0],
			})
		}
	}, [application, reset])

	// Handle missing id - redirect to dashboard (after all hooks)
	if (!id) {
		return <Navigate to="/" replace />
	}

	if (isLoading) return <QueryLoading />
	if (!application) return <QueryError title="Application not found" message="This application no longer exists." />

	const onUpdateDetails = async (data: ApplicationFormValues) => {
		try {
			await updateMutation.mutateAsync({
				...data,
				workType: data.workType as 'Remote' | 'Hybrid' | 'On-site' | undefined,
				status: data.status as ApplicationStatus | undefined,
				appliedAt: data.appliedAt,
			})
			navigate(`/applications/${id}`)
		} catch {
			// Error handled by mutation hook
		}
	}

	const onDeleteApplication = async () => {
		try {
			await deleteApplicationMutation.mutateAsync(id)
			navigate('/')
		} catch {
			// Error handled by mutation hook
		} finally {
			setIsDeleteDialogOpen(false)
		}
	}

	return (
		<div className="space-y-6">
			<PageHeader title="Edit Application" subtitle={application.company} backUrl={`/applications/${id}`} />

			<div className="max-w-3xl mx-auto">
				<Card>
					<CardHeader className="pb-3 flex flex-row items-center justify-between">
						<CardTitle className="text-lg font-semibold">Application Details</CardTitle>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit(onUpdateDetails)} className="space-y-6">
							<ApplicationFormFields
								register={register}
								setValue={setValue}
								control={control}
								errors={errors}
								showJobDescriptionUrl={true}
								showStatusFields={true}
							/>

							<div className="flex justify-between items-center pt-4 border-t">
								<AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
									<AlertDialogTrigger
										render={
											<Button
												type="button"
												variant="ghost"
												className="text-destructive hover:text-destructive hover:bg-destructive/10"
											>
												<Trash2 className="h-4 w-4 mr-2" />
												Delete Application
											</Button>
										}
									/>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>Delete Application?</AlertDialogTitle>
											<AlertDialogDescription>
												This will permanently delete the application for{' '}
												<strong>{application.company}</strong>. This action cannot be undone.
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel>Cancel</AlertDialogCancel>
											<AlertDialogAction
												onClick={onDeleteApplication}
												className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
												disabled={deleteApplicationMutation.isPending}
											>
												{deleteApplicationMutation.isPending ? 'Deleting...' : 'Delete'}
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>

								<div className="flex space-x-2">
									<Button
										type="button"
										variant="outline"
										onClick={() => navigate(`/applications/${id}`)}
									>
										Cancel
									</Button>
									<Button
										type="submit"
										disabled={!isDirty || isSubmitting}
										className="btn-primary-gradient"
									>
										{isSubmitting ? 'Saving...' : 'Save Changes'}
									</Button>
								</div>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
