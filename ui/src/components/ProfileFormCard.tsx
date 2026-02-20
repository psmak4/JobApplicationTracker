import { zodResolver } from '@hookform/resolvers/zod'
import { Calendar, Check, Loader2, User } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useCalendarStatus, useDisconnectCalendar } from '@/hooks/useCalendar'
import { useUpdateProfile } from '@/hooks/useProfile'
import { authClient } from '@/lib/auth-client'
import { type ProfileFormValues, profileSchema } from '@/lib/schemas'
import { formatDate } from '@/lib/utils'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from './ui/field'
import { Input } from './ui/input'

interface ProfileFormCardProps {
	user: {
		id: string
		name: string
		email: string
		image?: string | null
		createdAt: Date
	}
}

/**
 * Profile information card with editable name field
 */
export function ProfileFormCard({ user }: ProfileFormCardProps) {
	const updateProfile = useUpdateProfile()

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isDirty },
	} = useForm<ProfileFormValues>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			name: '',
		},
	})

	const { data: calendarStatus, isLoading: isCalendarStatusLoading } = useCalendarStatus()
	const disconnectCalendar = useDisconnectCalendar()

	// Reset form when user data loads
	useEffect(() => {
		reset({ name: user.name })
	}, [user, reset])

	const onSubmit = async (data: ProfileFormValues) => {
		try {
			await updateProfile.mutateAsync(data)
			toast.success('Profile updated successfully')
		} catch (error) {
			toast.error('Failed to update profile')
		}
	}

	return (
		<Card className="shadow-xl grow w-full">
			<CardHeader>
				<div className="flex items-center gap-4">
					<div className="h-16 w-16 rounded-full bg-linear-to-br from-primary/30 to-primary/10 flex items-center justify-center">
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
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					<FieldSet>
						<FieldGroup>
							{/* Name Field */}
							<Field>
								<FieldLabel htmlFor="name">Display Name</FieldLabel>
								<Input id="name" {...register('name')} placeholder="Your name" className="max-w-md" />
								<FieldError errors={[errors.name]} />
							</Field>

							{/* Email Field (Read-only) */}
							<Field>
								<FieldLabel>Email Address</FieldLabel>
								<Input value={user.email} disabled className="max-w-md bg-muted" />
								<p className="text-sm text-muted-foreground">Email address cannot be changed</p>
							</Field>
						</FieldGroup>
					</FieldSet>

					{/* Connected Accounts */}
					<div className="pt-4 border-t border-border space-y-3">
						<h4 className="text-sm font-medium">Connected Integrated Services</h4>
						<p className="text-sm text-muted-foreground">
							Link your Google account to enable calendar integration for interview tracking.
						</p>
						{calendarStatus?.connected ? (
							<Button
								type="button"
								variant="outline"
								className="w-full sm:w-auto text-destructive hover:text-destructive hover:bg-destructive/10"
								disabled={disconnectCalendar.isPending}
								onClick={() => disconnectCalendar.mutate()}
							>
								{disconnectCalendar.isPending ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : (
									<Calendar className="mr-2 h-4 w-4" />
								)}
								{disconnectCalendar.isPending ? 'Disconnecting...' : 'Disconnect Google Calendar'}
							</Button>
						) : (
							<Button
								type="button"
								variant="outline"
								className="w-full sm:w-auto"
								disabled={isCalendarStatusLoading}
								onClick={async () => {
									await authClient.signIn.social({
										provider: 'google',
										callbackURL: `${window.location.origin}/app/profile`,
									})
								}}
							>
								{isCalendarStatusLoading ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : (
									<Calendar className="mr-2 h-4 w-4" />
								)}
								Link Google Calendar
							</Button>
						)}
					</div>

					{/* Member Since */}
					<div className="pt-4 border-t border-border">
						<p className="text-sm text-muted-foreground">
							Member since {formatDate(user.createdAt, 'long')}
						</p>
					</div>

					{/* Submit Button */}
					<div className="flex justify-end pt-4">
						<Button type="submit" disabled={!isDirty || updateProfile.isPending} className="min-w-32">
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
	)
}
