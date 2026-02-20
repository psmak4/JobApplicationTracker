import type { Control, FieldError, FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form'
import { useWatch } from 'react-hook-form'
import { APPLICATION_STATUS_OPTIONS, WORK_TYPE_OPTIONS } from '@/constants'
import type { ApplicationStatus, WorkType } from '@/types'
import { Field, FieldError as FieldErrorComponent, FieldGroup, FieldLabel, FieldLegend, FieldSet } from './ui/field'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

/**
 * Base form values for application forms.
 * Used by both NewApplication and ApplicationEdit.
 */
export interface ApplicationFormFieldsValues {
	company: string
	jobTitle: string
	jobDescriptionUrl?: string
	salary?: string
	location?: string
	workType?: string
	contactInfo?: string
}

interface ApplicationFormFieldsProps {
	// Using `any` is necessary here because this component is designed to be reusable
	// with different form value shapes (ApplicationFormValues vs NewApplicationFormValues).
	// The component only uses fields that exist in all form types (company, jobTitle, etc.)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	register: UseFormRegister<any>
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	setValue: UseFormSetValue<any>
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: Control<any>
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	errors: FieldErrors<any>
	/** Show the Job Description URL field and section header */
	showJobDescriptionUrl?: boolean
	/** Optional content to render after the URL field (e.g., parsed data info) */
	urlFieldSuffix?: React.ReactNode
	/** Disable the URL field (e.g., during parsing) */
	urlFieldDisabled?: boolean
	/** Custom placeholder for company field */
	companyPlaceholder?: string
	/** Custom placeholder for job title field */
	jobTitlePlaceholder?: string
	/** Show status and appliedAt fields above notes */
	showStatusFields?: boolean
}

/**
 * Helper to safely extract a FieldError from a potentially nested error object
 */
function getFieldError(error: unknown): FieldError | undefined {
	if (!error) return undefined
	if (typeof error === 'object' && 'message' in error) {
		return error as FieldError
	}
	return undefined
}

/**
 * Shared form fields for creating/editing job applications.
 * Reduces duplication between NewApplication and ApplicationEdit pages.
 */
export function ApplicationFormFields({
	register,
	setValue,
	control,
	errors,
	showJobDescriptionUrl = true,
	urlFieldSuffix,
	urlFieldDisabled = false,
	companyPlaceholder = 'Acme Inc.',
	jobTitlePlaceholder = 'Software Engineer',
	showStatusFields = false,
}: ApplicationFormFieldsProps) {
	const currentWorkType = useWatch({ control, name: 'workType' })
	const currentStatus = useWatch({ control, name: 'status' })

	return (
		<>
			{showJobDescriptionUrl && (
				<FieldSet>
					<FieldLegend>Job Description URL</FieldLegend>
					<FieldGroup>
						<Field>
							<FieldLabel htmlFor="jobDescriptionUrl">URL</FieldLabel>
							<Input
								id="jobDescriptionUrl"
								placeholder="https://linkedin.com/jobs/..."
								{...register('jobDescriptionUrl')}
								disabled={urlFieldDisabled}
								className="input-glow"
							/>
							<FieldErrorComponent errors={[getFieldError(errors.jobDescriptionUrl)]} />
						</Field>
						{urlFieldSuffix}
					</FieldGroup>
				</FieldSet>
			)}

			<FieldSet>
				<FieldLegend>Job Details</FieldLegend>
				<FieldGroup>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Field>
							<FieldLabel htmlFor="company">
								Company <span className="text-red-500">*</span>
							</FieldLabel>
							<Input
								id="company"
								placeholder={companyPlaceholder}
								{...register('company')}
								className="input-glow"
							/>
							<FieldErrorComponent errors={[getFieldError(errors.company)]} />
						</Field>

						<Field>
							<FieldLabel htmlFor="jobTitle">
								Job Title <span className="text-red-500">*</span>
							</FieldLabel>
							<Input
								id="jobTitle"
								placeholder={jobTitlePlaceholder}
								{...register('jobTitle')}
								className="input-glow"
							/>
							<FieldErrorComponent errors={[getFieldError(errors.jobTitle)]} />
						</Field>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Field>
							<FieldLabel htmlFor="location">Location</FieldLabel>
							<Input
								id="location"
								placeholder="City, State or Remote"
								{...register('location')}
								className="input-glow"
							/>
							<FieldErrorComponent errors={[getFieldError(errors.location)]} />
						</Field>

						<Field>
							<FieldLabel htmlFor="salary">Salary Range</FieldLabel>
							<Input
								id="salary"
								placeholder="e.g., $100k - $150k"
								{...register('salary')}
								className="input-glow"
							/>
							<FieldErrorComponent errors={[getFieldError(errors.salary)]} />
						</Field>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Field>
							<FieldLabel htmlFor="workType">Work Type</FieldLabel>
							<Select
								value={currentWorkType || ''}
								onValueChange={(value) =>
									setValue('workType', value as WorkType, { shouldValidate: true })
								}
							>
								<SelectTrigger id="workType">
									<SelectValue placeholder="Select work type" />
								</SelectTrigger>
								<SelectContent>
									{WORK_TYPE_OPTIONS.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FieldErrorComponent errors={[getFieldError(errors.workType)]} />
						</Field>

						<Field>
							<FieldLabel htmlFor="contactInfo">Contact Information</FieldLabel>
							<Input
								id="contactInfo"
								placeholder="Recruiter email, phone, or LinkedIn"
								{...register('contactInfo')}
								className="input-glow"
							/>
							<FieldErrorComponent errors={[getFieldError(errors.contactInfo)]} />
						</Field>
					</div>

					{showStatusFields && (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<Field>
								<FieldLabel>Current Status</FieldLabel>
								<Select
									value={currentStatus || ''}
									onValueChange={(value) =>
										value && setValue('status', value as ApplicationStatus, { shouldDirty: true })
									}
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
								<FieldErrorComponent errors={[getFieldError(errors.status)]} />
							</Field>

							<Field>
								<FieldLabel htmlFor="appliedAt">Applied At</FieldLabel>
								<Input type="date" id="appliedAt" {...register('appliedAt')} className="input-glow" />
								<FieldErrorComponent errors={[getFieldError(errors.appliedAt)]} />
							</Field>
						</div>
					)}
				</FieldGroup>
			</FieldSet>
		</>
	)
}
