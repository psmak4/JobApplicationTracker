import { CheckCircle, Loader2, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AuthPageLayout } from '@/components/AuthPageLayout'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { authClient } from '@/lib/auth-client'

type VerificationState = 'loading' | 'success' | 'error'

export default function VerifyEmail() {
	const [searchParams] = useSearchParams()
	const token = searchParams.get('token')
	const [state, setState] = useState<VerificationState>('loading')
	const [errorMessage, setErrorMessage] = useState('')

	useEffect(() => {
		const verifyEmail = async () => {
			if (!token) {
				setState('error')
				setErrorMessage('No verification token provided.')
				return
			}

			try {
				await authClient.verifyEmail({
					query: { token },
				})
				setState('success')
			} catch (error) {
				setState('error')
				setErrorMessage('This verification link is invalid or has expired.')
			}
		}

		verifyEmail()
	}, [token])

	// Loading state - use a simpler layout since it's temporary
	if (state === 'loading') {
		return (
			<div className="flex items-center justify-center min-h-[80vh] px-4 sm:px-0">
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<div className="mx-auto mb-4">
							<Loader2 className="h-12 w-12 animate-spin text-primary" />
						</div>
						<CardTitle className="text-2xl">Verifying Email</CardTitle>
						<CardDescription>Please wait while we verify your email address...</CardDescription>
					</CardHeader>
				</Card>
			</div>
		)
	}

	if (state === 'success') {
		return (
			<AuthPageLayout
				title="Email Verified!"
				description="Your email has been successfully verified. You can now log in to your account."
				footer={
					<Link to="/login" className="w-full">
						<Button className="w-full">Continue to Login</Button>
					</Link>
				}
			>
				<div className="flex flex-col items-center gap-4">
					<CheckCircle className="h-12 w-12 text-emerald-500" />
					<p className="text-sm text-muted-foreground text-center">
						Thank you for verifying your email. You now have full access to all features.
					</p>
				</div>
			</AuthPageLayout>
		)
	}

	// Error state
	return (
		<AuthPageLayout
			title="Verification Failed"
			description={errorMessage}
			footer={
				<Link to="/login" className="w-full">
					<Button className="w-full">Go to Login</Button>
				</Link>
			}
		>
			<div className="flex flex-col items-center gap-4">
				<XCircle className="h-12 w-12 text-destructive" />
				<p className="text-sm text-muted-foreground text-center">
					Please request a new verification email from your account settings, or contact support if the
					problem persists.
				</p>
			</div>
		</AuthPageLayout>
	)
}
