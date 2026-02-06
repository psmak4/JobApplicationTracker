import { zodResolver } from '@hookform/resolvers/zod'
import { Key, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useChangePassword } from '@/hooks/useProfile'
import { getErrorMessage } from '@/lib/error-utils'
import { type ChangePasswordFormValues, changePasswordSchema } from '@/lib/schemas'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from './ui/field'
import { Input } from './ui/input'

/**
 * Password change card with current/new/confirm password fields
 */
export function ChangePasswordCard() {
	const changePassword = useChangePassword()

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<ChangePasswordFormValues>({
		resolver: zodResolver(changePasswordSchema),
		defaultValues: {
			currentPassword: '',
			newPassword: '',
			confirmPassword: '',
		},
	})

	const onSubmit = async (data: ChangePasswordFormValues) => {
		try {
			await changePassword.mutateAsync({
				currentPassword: data.currentPassword,
				newPassword: data.newPassword,
			})
			toast.success('Password changed successfully')
			reset()
		} catch (error) {
			toast.error(getErrorMessage(error, 'Failed to change password'))
		}
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-3">
					<div className="h-10 w-10 rounded-lg bg-linear-to-br from-orange-500/20 to-orange-500/5 flex items-center justify-center">
						<Key className="h-5 w-5 text-orange-600" />
					</div>
					<div>
						<CardTitle className="text-lg">Change Password</CardTitle>
						<CardDescription>Update your password to keep your account secure</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					<FieldSet>
						<FieldGroup>
							{/* Current Password */}
							<Field>
								<FieldLabel htmlFor="currentPassword">Current Password</FieldLabel>
								<Input
									id="currentPassword"
									type="password"
									{...register('currentPassword')}
									placeholder="Enter your current password"
									className="max-w-md"
								/>
								<FieldError errors={[errors.currentPassword]} />
							</Field>

							{/* New Password */}
							<Field>
								<FieldLabel htmlFor="newPassword">New Password</FieldLabel>
								<Input
									id="newPassword"
									type="password"
									{...register('newPassword')}
									placeholder="Enter a new password"
									className="max-w-md"
								/>
								<FieldError errors={[errors.newPassword]} />
								<p className="text-sm text-muted-foreground">
									At least 8 characters with uppercase, lowercase, and a number
								</p>
							</Field>

							{/* Confirm Password */}
							<Field>
								<FieldLabel htmlFor="confirmPassword">Confirm New Password</FieldLabel>
								<Input
									id="confirmPassword"
									type="password"
									{...register('confirmPassword')}
									placeholder="Confirm your new password"
									className="max-w-md"
								/>
								<FieldError errors={[errors.confirmPassword]} />
							</Field>
						</FieldGroup>
					</FieldSet>

					{/* Submit Button */}
					<div className="flex justify-end pt-4 border-t border-border">
						<Button type="submit" disabled={changePassword.isPending} className="min-w-32">
							{changePassword.isPending ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Changing...
								</>
							) : (
								<>
									<Key className="h-4 w-4 mr-2" />
									Change Password
								</>
							)}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	)
}
