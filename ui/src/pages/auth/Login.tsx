import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AuthPageLayout } from '@/components/AuthPageLayout'
import { LoadingFallback } from '@/components/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn, useSession } from '@/lib/auth-client'

export default function Login() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const navigate = useNavigate()
	const { data: session, isPending } = useSession()

	// Redirect to dashboard if already logged in
	if (isPending) return <LoadingFallback />
	if (session) return <Navigate to="/" replace />

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)

		await signIn.email(
			{
				email,
				password,
				callbackURL: '/app',
			},
			{
				onSuccess: () => {
					toast.success('Logged in successfully!')
					navigate('/')
				},
				onError: (ctx) => {
					toast.error(ctx.error.message || 'Failed to login')
				},
			},
		)
		setLoading(false)
	}

	return (
		<AuthPageLayout
			title="Login"
			description="Enter your credentials to access your job tracker."
			onSubmit={handleLogin}
			footer={
				<>
					<Button type="submit" className="w-full" disabled={loading}>
						{loading ? 'Logging in...' : 'Login'}
					</Button>
					<p className="text-sm text-center text-muted-foreground">
						Don't have an account?{' '}
						<Link to="/signup" className="text-primary hover:underline">
							Sign up
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
				/>
			</div>
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<Label htmlFor="password">Password</Label>
					<Link to="/forgot-password" className="text-sm text-primary hover:underline">
						Forgot password?
					</Link>
				</div>
				<Input
					id="password"
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
				/>
			</div>
		</AuthPageLayout>
	)
}
