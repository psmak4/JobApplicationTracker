import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Sparkles, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ApplicationFormFields } from '@/components/ApplicationFormFields'
import PageHeader from '@/components/PageHeader'
import { APPLICATION_STATUS_OPTIONS } from '@/constants'
import apiClient from '@/lib/api-client'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from '../components/ui/field'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { useCreateApplication } from '../hooks/useMutations'
import { getErrorMessage, isAxiosError, isRateLimitError } from '../lib/error-utils'
import { type NewApplicationFormValues, newApplicationSchema } from '../lib/schemas'
import type { ApplicationStatus, WorkType } from '../types'

interface ParsedJobData {
	company?: string
	jobTitle?: string
	location?: string
	salary?: string
	workType?: 'Remote' | 'Hybrid' | 'On-site'
	confidence?: 'high' | 'medium' | 'low'
}

export default function NewApplication() {
	const navigate = useNavigate()
	const createMutation = useCreateApplication()
	const [isParsing, setIsParsing] = useState(false)
	const [parsedData, setParsedData] = useState<ParsedJobData | null>(null)
	const abortControllerRef = useRef<AbortController | null>(null)

	const {
		register,
		handleSubmit,
		setValue,
		control,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<NewApplicationFormValues>({
		resolver: zodResolver(newApplicationSchema),
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
			initialStatusDate: new Date().toLocaleDateString('en-US'),
		},
	})

	const jobDescriptionUrl = watch('jobDescriptionUrl')
	const currentStatus = useWatch({ control, name: 'initialStatus' })

	const handleCancelParse = () => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort()
			abortControllerRef.current = null
		}
		setIsParsing(false)
		toast.info('Parsing cancelled')
	}

	const handleParseJob = async () => {
		if (!jobDescriptionUrl) {
			toast.error('Please enter a job description URL first')
			return
		}

		// Validate URL format
		try {
			new URL(jobDescriptionUrl)
		} catch {
			toast.error('Please enter a valid URL')
			return
		}

		// Cancel any existing request
		if (abortControllerRef.current) {
			abortControllerRef.current.abort()
		}

		abortControllerRef.current = new AbortController()
		setIsParsing(true)
		setParsedData(null)

		try {
			const response = await apiClient.post(
				'/parser/parse',
				{ url: jobDescriptionUrl },
				{ signal: abortControllerRef.current.signal },
			)

			const { data, success } = response.data

			if (success && data) {
				// Auto-fill form fields with parsed data
				if (data.company) setValue('company', data.company, { shouldValidate: true })
				if (data.jobTitle) setValue('jobTitle', data.jobTitle, { shouldValidate: true })
				if (data.location) setValue('location', data.location)
				if (data.salary) setValue('salary', data.salary)
				if (data.workType) setValue('workType', data.workType)

				setParsedData(data)

				// Show success message based on confidence
				if (data.confidence === 'high') {
					toast.success('Job details extracted successfully!', {
						description: 'Please review the auto-filled information.',
					})
				} else if (data.confidence === 'medium') {
					toast.success('Job details partially extracted', {
						description: 'Some information was found. Please fill in missing details.',
					})
				} else {
					toast.warning('Limited information extracted', {
						description: 'Please manually fill in the job details.',
					})
				}
			} else {
				toast.error('Could not parse job posting', {
					description: response.data.error || 'Please enter the details manually.',
				})
			}
		} catch (error: unknown) {
			// Ignore abort errors (user cancelled)
			if (error instanceof Error && error.name === 'CanceledError') {
				return
			}

			if (isRateLimitError(error)) {
				toast.error('Too many parse requests', {
					description: 'Please wait a moment before trying again.',
				})
			} else if (isAxiosError(error) && error.response?.status === 400) {
				toast.error('Invalid job posting URL', {
					description: getErrorMessage(error, 'This URL is not supported.'),
				})
			} else {
				toast.error('Failed to parse job posting', {
					description: getErrorMessage(error, 'Please enter the details manually.'),
				})
			}
		} finally {
			setIsParsing(false)
			abortControllerRef.current = null
		}
	}

	const onSubmit = async (data: NewApplicationFormValues) => {
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
			navigate('/')
		} catch {
			// Error handled by mutation hook
		}
	}

	// Custom URL field with auto-fill button
	const urlFieldContent = (
		<>
			<Field>
				<FieldLabel htmlFor="jobDescriptionUrl">URL</FieldLabel>
				<div className="flex gap-2">
					<Input
						id="jobDescriptionUrl"
						placeholder="https://linkedin.com/jobs/..."
						{...register('jobDescriptionUrl')}
						className="flex-1"
						disabled={isParsing}
					/>
					{isParsing ? (
						<>
							<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
							<Button
								type="button"
								onClick={handleCancelParse}
								variant="destructive"
								size="sm"
								className="shrink-0"
							>
								<X className="h-4 w-4 mr-1" />
								Cancel
							</Button>
						</>
					) : (
						<Button
							type="button"
							onClick={handleParseJob}
							disabled={!jobDescriptionUrl}
							variant="secondary"
							className="shrink-0"
						>
							<Sparkles className="h-4 w-4 mr-2" />
							Auto-fill
						</Button>
					)}
				</div>
				<FieldDescription>
					Paste a job posting URL from LinkedIn, Indeed, or other supported sites to auto-fill details.
				</FieldDescription>
				<FieldError errors={[errors.jobDescriptionUrl]} />
			</Field>
			{parsedData && (
				<div className="p-4 bg-muted/50 rounded-lg border">
					<p className="text-sm font-medium mb-2">
						Auto-filled from {parsedData.confidence === 'high' ? '✓' : '⚠️'} {parsedData.confidence}{' '}
						confidence
					</p>
					<ul className="text-sm text-muted-foreground space-y-1">
						{parsedData.company && <li>• Company: {parsedData.company}</li>}
						{parsedData.jobTitle && <li>• Job Title: {parsedData.jobTitle}</li>}
						{parsedData.location && <li>• Location: {parsedData.location}</li>}
						{parsedData.salary && <li>• Salary: {parsedData.salary}</li>}
						{parsedData.workType && <li>• Work Type: {parsedData.workType}</li>}
					</ul>
				</div>
			)}
		</>
	)

	return (
		<div className="space-y-6">
			<PageHeader title="New Application" subtitle="Track a new job application." backUrl="/" />

			<div className="max-w-3xl mx-auto">
				<Card>
					<CardContent className="p-6">
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
							{/* Custom Job URL section with auto-fill */}
							<FieldSet>
								<FieldLegend>Job Description URL</FieldLegend>
								<FieldGroup>{urlFieldContent}</FieldGroup>
							</FieldSet>

							{/* Shared form fields (without URL since we handle it custom) */}
							<ApplicationFormFields
								register={register}
								setValue={setValue}
								control={control}
								errors={errors}
								showJobDescriptionUrl={false}
							/>

							{/* Status section (only for new applications) */}
							<FieldSet>
								<FieldLegend>Status</FieldLegend>
								<FieldGroup>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<Field>
											<FieldLabel>Initial Status</FieldLabel>
											<Select
												onValueChange={(value) =>
													setValue('initialStatus', value as ApplicationStatus)
												}
												value={currentStatus}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select status" />
												</SelectTrigger>
												<SelectContent>
													{APPLICATION_STATUS_OPTIONS.map((status) => (
														<SelectItem key={status} value={status}>
															{status}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FieldError errors={[errors.initialStatus]} />
										</Field>

										<Field>
											<FieldLabel htmlFor="initialStatusDate">Date</FieldLabel>
											<Input
												type="date"
												id="initialStatusDate"
												{...register('initialStatusDate')}
											/>
											<FieldError errors={[errors.initialStatusDate]} />
										</Field>
									</div>
								</FieldGroup>
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
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
