import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ApplicationFormFields } from '@/components/ApplicationFormFields'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { useApplication } from '../hooks/useApplications'
import { useUpdateApplication } from '../hooks/useMutations'
import { getErrorMessage } from '../lib/error-utils'
import { type ApplicationFormValues, applicationSchema } from '../lib/schemas'

export default function ApplicationEdit() {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()

	// All hooks must be called before any conditional returns
	const { data: application, isLoading } = useApplication(id ?? '')
	const updateMutation = useUpdateApplication(id ?? '')

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
			notes: '',
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
				notes: application.notes || '',
			})
		}
	}, [application, reset])

	// Handle missing id - redirect to dashboard (after all hooks)
	if (!id) {
		return <Navigate to="/" replace />
	}

	if (isLoading) return <div className="p-8 text-center">Loading...</div>
	if (!application) return <div className="p-8 text-center text-destructive">Application not found</div>

	const onUpdateDetails = async (data: ApplicationFormValues) => {
		try {
			await updateMutation.mutateAsync(data)
			toast.success('Details updated successfully!')
			navigate(`/applications/${id}`)
		} catch (err) {
			toast.error(getErrorMessage(err, 'Failed to update application'))
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => navigate(`/applications/${id}`)}
					aria-label="Back to application"
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Edit Application</h1>
					<p className="text-muted-foreground">{application.company}</p>
				</div>
			</div>

			<div className="max-w-3xl mx-auto">
				<Card>
					<CardHeader>
						<CardTitle>Application Details</CardTitle>
						<CardDescription>Update application information.</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit(onUpdateDetails)} className="space-y-6">
							<ApplicationFormFields
								register={register}
								setValue={setValue}
								control={control}
								errors={errors}
								showJobDescriptionUrl={true}
							/>
							<div className="flex justify-end space-x-2">
								<Button type="button" variant="outline" onClick={() => navigate(`/applications/${id}`)}>
									Cancel
								</Button>
								<Button type="submit" disabled={!isDirty || isSubmitting}>
									{isSubmitting ? 'Saving...' : 'Save Changes'}
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
