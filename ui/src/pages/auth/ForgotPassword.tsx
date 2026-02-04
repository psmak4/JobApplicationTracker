import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { AuthPageLayout } from '@/components/AuthPageLayout'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { authClient } from '@/lib/auth-client'
import { type ForgotPasswordFormValues, forgotPasswordSchema } from '@/lib/schemas'

export default function ForgotPassword() {
	const [loading, setLoading] = useState(false)
	const [submitted, setSubmitted] = useState(false)
	const [submittedEmail, setSubmittedEmail] = useState('')

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ForgotPasswordFormValues>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: {
			email: '',
		},
	})

	const onSubmit = async (data: ForgotPasswordFormValues) => {
		setLoading(true)

		try {
			await authClient.requestPasswordReset({
				email: data.email,
				redirectTo: '/app/reset-password',
			})
			setSubmittedEmail(data.email)
			setSubmitted(true)
			toast.success('Password reset email sent!')
		} catch {
			toast.error('Failed to send reset email. Please try again.')
		} finally {
			setLoading(false)
		}
	}

	// Success state - show confirmation message
	if (submitted) {
		return (
			<AuthPageLayout
				title="Check Your Email"
				description={`If an account exists for ${submittedEmail}, we've sent a password reset link.`}
				footer={
					<Link to="/login" className="w-full">
						<Button variant="outline" className="w-full">
							Back to Login
						</Button>
					</Link>
				}
			>
				<p className="text-sm text-muted-foreground">
					Click the link in the email to reset your password. The link will expire in 1 hour.
				</p>
				<p className="text-sm text-muted-foreground">
					Didn't receive an email? Check your spam folder or{' '}
					<button type="button" onClick={() => setSubmitted(false)} className="text-primary hover:underline">
						try again
					</button>
					.
				</p>
			</AuthPageLayout>
		)
	}

	return (
		<AuthPageLayout
			title="Forgot Password"
			description="Enter your email address and we'll send you a link to reset your password."
			onSubmit={handleSubmit(onSubmit)}
			footer={
				<>
					<Button type="submit" className="w-full" disabled={loading}>
						{loading ? 'Sending...' : 'Send Reset Link'}
					</Button>
					<p className="text-sm text-center text-muted-foreground">
						Remember your password?{' '}
						<Link to="/login" className="text-primary hover:underline">
							Back to Login
						</Link>
					</p>
				</>
			}
		>
			<FieldGroup>
				<Field>
					<FieldLabel htmlFor="email">Email</FieldLabel>
					<Input id="email" type="email" placeholder="name@example.com" autoFocus {...register('email')} />
					<FieldError errors={[errors.email]} />
				</Field>
			</FieldGroup>
		</AuthPageLayout>
	)
}
