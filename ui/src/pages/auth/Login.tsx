import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AuthPageLayout } from '@/components/AuthPageLayout'
import { LoadingFallback } from '@/components/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { signIn, useSession } from '@/lib/auth-client'
import { type LoginFormValues, loginSchema } from '@/lib/schemas'

export default function Login() {
	const [loading, setLoading] = useState(false)
	const navigate = useNavigate()
	const { data: session, isPending } = useSession()

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	})

	// Redirect to dashboard if already logged in
	if (isPending) return <LoadingFallback />
	if (session) return <Navigate to="/" replace />

	const handleLogin = async (data: LoginFormValues) => {
		setLoading(true)

		await signIn.email(
			{
				email: data.email,
				password: data.password,
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
			onSubmit={handleSubmit(handleLogin)}
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
			<FieldGroup>
				<Field>
					<FieldLabel htmlFor="email">Email</FieldLabel>
					<Input id="email" type="email" placeholder="name@example.com" {...register('email')} />
					<FieldError errors={[errors.email]} />
				</Field>
				<Field>
					<div className="flex items-center justify-between">
						<FieldLabel htmlFor="password">Password</FieldLabel>
						<Link to="/forgot-password" className="text-sm text-primary hover:underline">
							Forgot password?
						</Link>
					</div>
					<Input id="password" type="password" {...register('password')} />
					<FieldError errors={[errors.password]} />
				</Field>
			</FieldGroup>
		</AuthPageLayout>
	)
}
