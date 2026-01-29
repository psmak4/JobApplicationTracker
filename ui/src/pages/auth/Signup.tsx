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
import { signUp, useSession } from '@/lib/auth-client'
import { type SignupFormValues, signupSchema } from '@/lib/schemas'

export default function Signup() {
	const [loading, setLoading] = useState(false)
	const navigate = useNavigate()
	const { data: session, isPending } = useSession()

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SignupFormValues>({
		resolver: zodResolver(signupSchema),
		defaultValues: {
			name: '',
			email: '',
			password: '',
		},
	})

	// Redirect to dashboard if already logged in
	if (isPending) return <LoadingFallback />
	if (session) return <Navigate to="/" replace />

	const handleSignup = async (data: SignupFormValues) => {
		setLoading(true)

		await signUp.email(
			{
				email: data.email,
				password: data.password,
				name: data.name,
				callbackURL: '/app',
			},
			{
				onSuccess: () => {
					toast.success('Account created successfully!')
					navigate('/')
				},
				onError: (ctx) => {
					toast.error(ctx.error.message || 'Failed to create account')
				},
			},
		)
		setLoading(false)
	}

	return (
		<AuthPageLayout
			title="Create an account"
			description="Enter your details to get started with Job Tracker."
			onSubmit={handleSubmit(handleSignup)}
			footer={
				<>
					<Button type="submit" className="w-full" disabled={loading}>
						{loading ? 'Creating account...' : 'Sign up'}
					</Button>
					<p className="text-sm text-center text-muted-foreground">
						Already have an account?{' '}
						<Link to="/login" className="text-primary hover:underline">
							Login
						</Link>
					</p>
				</>
			}
		>
			<FieldGroup>
				<Field>
					<FieldLabel htmlFor="name">Full Name</FieldLabel>
					<Input id="name" type="text" placeholder="John Doe" {...register('name')} />
					<FieldError errors={[errors.name]} />
				</Field>
				<Field>
					<FieldLabel htmlFor="email">Email</FieldLabel>
					<Input id="email" type="email" placeholder="name@example.com" {...register('email')} />
					<FieldError errors={[errors.email]} />
				</Field>
				<Field>
					<FieldLabel htmlFor="password">Password</FieldLabel>
					<Input id="password" type="password" {...register('password')} />
					<FieldError errors={[errors.password]} />
					<p className="text-sm text-muted-foreground">
						At least 8 characters with uppercase, lowercase, and a number
					</p>
				</Field>
			</FieldGroup>
		</AuthPageLayout>
	)
}
