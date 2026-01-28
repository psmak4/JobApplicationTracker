import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Key, Loader2, User } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { LoadingFallback } from '@/components/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useChangePassword, useUpdateProfile } from '@/hooks/useProfile'
import { useSession } from '@/lib/auth-client'
import { getErrorMessage } from '@/lib/error-utils'

// Validation schema for profile form
const profileSchema = z.object({
	name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
})

// Validation schema for password change form
const passwordSchema = z
	.object({
		currentPassword: z.string().min(1, 'Current password is required'),
		newPassword: z
			.string()
			.min(8, 'Password must be at least 8 characters')
			.regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
			.regex(/[a-z]/, 'Password must contain at least one lowercase letter')
			.regex(/[0-9]/, 'Password must contain at least one number'),
		confirmPassword: z.string().min(1, 'Please confirm your new password'),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword'],
	})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

export default function Profile() {
	const { data: session, isPending } = useSession()
	const updateProfile = useUpdateProfile()
	const changePassword = useChangePassword()

	const user = session?.user as {
		id: string
		name: string
		email: string
		image?: string | null
		createdAt: Date
	} | null

	// Profile form
	const {
		register: registerProfile,
		handleSubmit: handleSubmitProfile,
		reset: resetProfile,
		formState: { errors: profileErrors, isDirty: isProfileDirty },
	} = useForm<ProfileFormData>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			name: '',
		},
	})

	// Password form
	const {
		register: registerPassword,
		handleSubmit: handleSubmitPassword,
		reset: resetPassword,
		formState: { errors: passwordErrors },
	} = useForm<PasswordFormData>({
		resolver: zodResolver(passwordSchema),
		defaultValues: {
			currentPassword: '',
			newPassword: '',
			confirmPassword: '',
		},
	})

	// Reset profile form when user data loads
	useEffect(() => {
		if (user) {
			resetProfile({
				name: user.name,
			})
		}
	}, [user, resetProfile])

	const onSubmitProfile = async (data: ProfileFormData) => {
		try {
			await updateProfile.mutateAsync(data)
			toast.success('Profile updated successfully')
		} catch (error) {
			toast.error('Failed to update profile')
		}
	}

	const onSubmitPassword = async (data: PasswordFormData) => {
		try {
			await changePassword.mutateAsync({
				currentPassword: data.currentPassword,
				newPassword: data.newPassword,
			})
			toast.success('Password changed successfully')
			resetPassword()
		} catch (error) {
			toast.error(getErrorMessage(error, 'Failed to change password'))
		}
	}

	if (isPending) {
		return <LoadingFallback />
	}

	if (!user) {
		return null
	}

	return (
		<div className="max-w-2xl mx-auto space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold">Profile Settings</h1>
				<p className="text-muted-foreground">Manage your account information</p>
			</div>

			{/* Profile Card */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-4">
						<div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
							{user.image ? (
								<img src={user.image} alt={user.name} className="h-16 w-16 rounded-full object-cover" />
							) : (
								<User className="h-8 w-8 text-primary" />
							)}
						</div>
						<div>
							<CardTitle>{user.name}</CardTitle>
							<CardDescription>{user.email}</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">
						<FieldSet>
							<FieldGroup>
								{/* Name Field */}
								<Field>
									<FieldLabel htmlFor="name">Display Name</FieldLabel>
									<Input
										id="name"
										{...registerProfile('name')}
										placeholder="Your name"
										className="max-w-md"
									/>
									<FieldError errors={[profileErrors.name]} />
								</Field>

								{/* Email Field (Read-only) */}
								<Field>
									<FieldLabel>Email Address</FieldLabel>
									<Input value={user.email} disabled className="max-w-md bg-muted" />
									<p className="text-sm text-muted-foreground">Email address cannot be changed</p>
								</Field>
							</FieldGroup>
						</FieldSet>

						{/* Member Since */}
						<div className="pt-4 border-t border-border">
							<p className="text-sm text-muted-foreground">
								Member since{' '}
								{new Date(user.createdAt).toLocaleDateString('en-US', {
									year: 'numeric',
									month: 'long',
									day: 'numeric',
								})}
							</p>
						</div>

						{/* Submit Button */}
						<div className="flex justify-end pt-4">
							<Button
								type="submit"
								disabled={!isProfileDirty || updateProfile.isPending}
								className="min-w-32"
							>
								{updateProfile.isPending ? (
									<>
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										Saving...
									</>
								) : (
									<>
										<Check className="h-4 w-4 mr-2" />
										Save Changes
									</>
								)}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>

			{/* Change Password Card */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-500/5 flex items-center justify-center">
							<Key className="h-5 w-5 text-orange-600" />
						</div>
						<div>
							<CardTitle className="text-lg">Change Password</CardTitle>
							<CardDescription>Update your password to keep your account secure</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-6">
						<FieldSet>
							<FieldGroup>
								{/* Current Password */}
								<Field>
									<FieldLabel htmlFor="currentPassword">Current Password</FieldLabel>
									<Input
										id="currentPassword"
										type="password"
										{...registerPassword('currentPassword')}
										placeholder="Enter your current password"
										className="max-w-md"
									/>
									<FieldError errors={[passwordErrors.currentPassword]} />
								</Field>

								{/* New Password */}
								<Field>
									<FieldLabel htmlFor="newPassword">New Password</FieldLabel>
									<Input
										id="newPassword"
										type="password"
										{...registerPassword('newPassword')}
										placeholder="Enter a new password"
										className="max-w-md"
									/>
									<FieldError errors={[passwordErrors.newPassword]} />
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
										{...registerPassword('confirmPassword')}
										placeholder="Confirm your new password"
										className="max-w-md"
									/>
									<FieldError errors={[passwordErrors.confirmPassword]} />
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
		</div>
	)
}
