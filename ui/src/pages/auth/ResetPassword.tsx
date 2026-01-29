import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { AuthPageLayout } from '@/components/AuthPageLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'

export default function ResetPassword() {
	const [searchParams] = useSearchParams()
	const navigate = useNavigate()
	const token = searchParams.get('token')

	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [loading, setLoading] = useState(false)

	// If no token, show error state
	if (!token) {
		return (
			<AuthPageLayout
				title="Invalid Reset Link"
				description="This password reset link is invalid or has expired."
				footer={
					<Link to="/forgot-password" className="w-full">
						<Button className="w-full">Request New Link</Button>
					</Link>
				}
			>
				<p className="text-sm text-muted-foreground">Please request a new password reset link.</p>
			</AuthPageLayout>
		)
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (password !== confirmPassword) {
			toast.error('Passwords do not match')
			return
		}

		if (password.length < 8) {
			toast.error('Password must be at least 8 characters')
			return
		}

		setLoading(true)

		try {
			await authClient.resetPassword({
				newPassword: password,
				token,
			})
			toast.success('Password reset successfully!')
			navigate('/login')
		} catch (error) {
			toast.error('Failed to reset password. The link may have expired.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<AuthPageLayout
			title="Reset Password"
			description="Enter your new password below."
			onSubmit={handleSubmit}
			footer={
				<>
					<Button type="submit" className="w-full" disabled={loading}>
						{loading ? 'Resetting...' : 'Reset Password'}
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
				<Label htmlFor="password">New Password</Label>
				<Input
					id="password"
					type="password"
					placeholder="Enter new password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
					minLength={8}
					autoFocus
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="confirmPassword">Confirm Password</Label>
				<Input
					id="confirmPassword"
					type="password"
					placeholder="Confirm new password"
					value={confirmPassword}
					onChange={(e) => setConfirmPassword(e.target.value)}
					required
					minLength={8}
				/>
			</div>
		</AuthPageLayout>
	)
}
