import type { Control, FieldError, FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form'
import { useWatch } from 'react-hook-form'
import { WORK_TYPE_OPTIONS } from '@/constants'
import type { WorkType } from '@/types'
import { Field, FieldError as FieldErrorComponent, FieldGroup, FieldLabel, FieldLegend, FieldSet } from './ui/field'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'

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
	notes?: string
}

interface ApplicationFormFieldsProps {
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
}: ApplicationFormFieldsProps) {
	const currentWorkType = useWatch({ control, name: 'workType' })

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
							/>
							<FieldErrorComponent errors={[getFieldError(errors.jobDescriptionUrl)]} />
						</Field>
						{urlFieldSuffix}
					</FieldGroup>
				</FieldSet>
			)}

			<FieldSet>
				<FieldLegend>Basic Information</FieldLegend>
				<FieldGroup>
					<Field>
						<FieldLabel htmlFor="company">Company</FieldLabel>
						<Input id="company" placeholder={companyPlaceholder} {...register('company')} />
						<FieldErrorComponent errors={[getFieldError(errors.company)]} />
					</Field>

					<Field>
						<FieldLabel htmlFor="jobTitle">Job Title</FieldLabel>
						<Input id="jobTitle" placeholder={jobTitlePlaceholder} {...register('jobTitle')} />
						<FieldErrorComponent errors={[getFieldError(errors.jobTitle)]} />
					</Field>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Field>
							<FieldLabel htmlFor="salary">Salary / Compensation</FieldLabel>
							<Input id="salary" placeholder="$120k - $150k" {...register('salary')} />
							<FieldErrorComponent errors={[getFieldError(errors.salary)]} />
						</Field>
						<Field>
							<FieldLabel htmlFor="location">Location (City, State)</FieldLabel>
							<Input id="location" placeholder="San Francisco, CA" {...register('location')} />
							<FieldErrorComponent errors={[getFieldError(errors.location)]} />
						</Field>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Field>
							<FieldLabel>Work Type</FieldLabel>
							<Select
								onValueChange={(value) =>
									setValue('workType', value as WorkType, { shouldDirty: true })
								}
								value={currentWorkType}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select work type" />
								</SelectTrigger>
								<SelectContent>
									{WORK_TYPE_OPTIONS.map((type) => (
										<SelectItem key={type} value={type}>
											{type}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FieldErrorComponent errors={[getFieldError(errors.workType)]} />
						</Field>
						<Field>
							<FieldLabel htmlFor="contactInfo">Contact Info</FieldLabel>
							<Input id="contactInfo" placeholder="Recruiter Name / Email" {...register('contactInfo')} />
							<FieldErrorComponent errors={[getFieldError(errors.contactInfo)]} />
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
		</>
	)
}
