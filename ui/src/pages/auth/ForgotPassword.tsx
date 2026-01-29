import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { AuthPageLayout } from '@/components/AuthPageLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'

export default function ForgotPassword() {
	const [email, setEmail] = useState('')
	const [loading, setLoading] = useState(false)
	const [submitted, setSubmitted] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)

		try {
			await authClient.requestPasswordReset({
				email,
				redirectTo: '/app/reset-password',
			})
			setSubmitted(true)
			toast.success('Password reset email sent!')
		} catch (error) {
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
				description={`If an account exists for ${email}, we've sent a password reset link.`}
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
			onSubmit={handleSubmit}
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
			<div className="space-y-2">
				<Label htmlFor="email">Email</Label>
				<Input
					id="email"
					type="email"
					placeholder="name@example.com"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
					autoFocus
				/>
			</div>
		</AuthPageLayout>
	)
}
