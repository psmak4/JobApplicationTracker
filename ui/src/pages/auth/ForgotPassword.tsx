import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
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

	if (submitted) {
		return (
			<div className="flex items-center justify-center min-h-[80vh] px-4 sm:px-0">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle className="text-2xl">Check Your Email</CardTitle>
						<CardDescription>
							If an account exists for {email}, we've sent a password reset link.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-sm text-muted-foreground">
							Click the link in the email to reset your password. The link will expire in 1 hour.
						</p>
						<p className="text-sm text-muted-foreground">
							Didn't receive an email? Check your spam folder or{' '}
							<button
								type="button"
								onClick={() => setSubmitted(false)}
								className="text-primary hover:underline"
							>
								try again
							</button>
							.
						</p>
					</CardContent>
					<CardFooter>
						<Link to="/login" className="w-full">
							<Button variant="outline" className="w-full">
								Back to Login
							</Button>
						</Link>
					</CardFooter>
				</Card>
			</div>
		)
	}

	return (
		<div className="flex items-center justify-center min-h-[80vh] px-4 sm:px-0">
			<form onSubmit={handleSubmit} className="w-full max-w-md">
				<Card>
					<CardHeader>
						<CardTitle className="text-2xl">Forgot Password</CardTitle>
						<CardDescription>
							Enter your email address and we'll send you a link to reset your password.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
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
					</CardContent>
					<CardFooter className="flex flex-col space-y-4">
						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? 'Sending...' : 'Send Reset Link'}
						</Button>
						<p className="text-sm text-center text-muted-foreground">
							Remember your password?{' '}
							<Link to="/login" className="text-primary hover:underline">
								Back to Login
							</Link>
						</p>
					</CardFooter>
				</Card>
			</form>
		</div>
	)
}
