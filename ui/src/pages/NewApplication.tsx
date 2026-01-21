import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import * as z from 'zod'
import { Button } from '../components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '../components/ui/field'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Textarea } from '../components/ui/textarea'
import { useCreateApplication } from '../hooks/useMutations'
import type { ApplicationStatus, WorkType } from '../types'

const applicationSchema = z.object({
	company: z.string().min(1, 'Company name is required'),
	jobTitle: z.string().min(1, 'Job title is required'),
	jobDescriptionUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
	salary: z.string().optional(),
	location: z.string().optional(),
	workType: z.enum(['Remote', 'Hybrid', 'On-site'] as [string, ...string[]]).optional(),
	contactInfo: z.string().optional(),
	notes: z.string().optional(),
	initialStatus: z.enum([
		'Applied',
		'Phone Screen',
		'Technical Interview',
		'On-site Interview',
		'Offer',
		'Rejected',
		'Withdrawn',
		'Other',
	] as [string, ...string[]]),
	initialStatusDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
		message: 'Invalid date',
	}),
})

type ApplicationFormValues = z.infer<typeof applicationSchema>

export default function NewApplication() {
	const navigate = useNavigate()
	const createMutation = useCreateApplication()

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors, isSubmitting },
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
			initialStatus: 'Applied',
			initialStatusDate: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD
		},
	})

	const onSubmit = async (data: ApplicationFormValues) => {
		try {
			await createMutation.mutateAsync({
				company: data.company,
				jobTitle: data.jobTitle,
				jobDescriptionUrl: data.jobDescriptionUrl || undefined,
				salary: data.salary || undefined,
				location: data.location || undefined,
				workType: data.workType as WorkType | undefined,
				contactInfo: data.contactInfo || undefined,
				notes: data.notes || undefined,
				status: data.initialStatus as ApplicationStatus,
				date: data.initialStatusDate,
			})
			toast.success('Application created successfully!')
			navigate('/')
		} catch {
			toast.error('Failed to create application')
		}
	}

	const currentStatus = watch('initialStatus')
	const currentWorkType = watch('workType')

	return (
		<div className="max-w-2xl mx-auto">
			<div className="mb-6">
				<h1 className="text-3xl font-bold tracking-tight">New Application</h1>
				<p className="text-muted-foreground">Track a new job application.</p>
			</div>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
				<FieldSet>
					<FieldLegend>Basic Information</FieldLegend>
					<FieldGroup>
						<Field>
							<FieldLabel htmlFor="company">Company</FieldLabel>
							<Input id="company" placeholder="Acme Inc." {...register('company')} />
							<FieldError errors={[errors.company]} />
						</Field>

						<Field>
							<FieldLabel htmlFor="jobTitle">Job Title</FieldLabel>
							<Input id="jobTitle" placeholder="Software Engineer" {...register('jobTitle')} />
							<FieldError errors={[errors.jobTitle]} />
						</Field>

						<Field>
							<FieldLabel htmlFor="jobDescriptionUrl">Job Description URL</FieldLabel>
							<Input
								id="jobDescriptionUrl"
								placeholder="https://..."
								{...register('jobDescriptionUrl')}
							/>
							<FieldError errors={[errors.jobDescriptionUrl]} />
						</Field>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<Field>
								<FieldLabel htmlFor="salary">Salary / Compensation</FieldLabel>
								<Input id="salary" placeholder="$120k - $150k" {...register('salary')} />
								<FieldError errors={[errors.salary]} />
							</Field>
							<Field>
								<FieldLabel htmlFor="location">Location (City, State)</FieldLabel>
								<Input id="location" placeholder="San Francisco, CA" {...register('location')} />
								<FieldError errors={[errors.location]} />
							</Field>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<Field>
								<FieldLabel>Work Type</FieldLabel>
								<Select
									onValueChange={(value) => setValue('workType', value as WorkType)}
									value={currentWorkType}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select work type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Remote">Remote</SelectItem>
										<SelectItem value="Hybrid">Hybrid</SelectItem>
										<SelectItem value="On-site">On-site</SelectItem>
									</SelectContent>
								</Select>
								<FieldError errors={[errors.workType]} />
							</Field>
							<Field>
								<FieldLabel htmlFor="contactInfo">Contact Info</FieldLabel>
								<Input
									id="contactInfo"
									placeholder="Recruiter Name / Email"
									{...register('contactInfo')}
								/>
								<FieldError errors={[errors.contactInfo]} />
							</Field>
						</div>
					</FieldGroup>
				</FieldSet>

				<FieldSet>
					<FieldLegend>Status</FieldLegend>
					<FieldGroup>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<Field>
								<FieldLabel>Initial Status</FieldLabel>
								<Select
									onValueChange={(value) => setValue('initialStatus', value as ApplicationStatus)}
									value={currentStatus}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Applied">Applied</SelectItem>
										<SelectItem value="Phone Screen">Phone Screen</SelectItem>
										<SelectItem value="Technical Interview">Technical Interview</SelectItem>
										<SelectItem value="On-site Interview">On-site Interview</SelectItem>
										<SelectItem value="Offer">Offer</SelectItem>
										<SelectItem value="Rejected">Rejected</SelectItem>
										<SelectItem value="Withdrawn">Withdrawn</SelectItem>
										<SelectItem value="Other">Other</SelectItem>
									</SelectContent>
								</Select>
								<FieldError errors={[errors.initialStatus]} />
							</Field>

							<Field>
								<FieldLabel htmlFor="initialStatusDate">Date</FieldLabel>
								<Input type="date" id="initialStatusDate" {...register('initialStatusDate')} />
								<FieldError errors={[errors.initialStatusDate]} />
							</Field>
						</div>
					</FieldGroup>
				</FieldSet>

				<FieldSet>
					<FieldLegend>Notes</FieldLegend>
					<Field>
						<Textarea placeholder="Any additional notes..." className="min-h-25" {...register('notes')} />
					</Field>
				</FieldSet>

				<div className="flex justify-end space-x-4">
					<Button variant="outline" type="button" onClick={() => navigate('/')}>
						Cancel
					</Button>
					<Button type="submit" disabled={isSubmitting}>
						Save Application
					</Button>
				</div>
			</form>
		</div>
	)
}
