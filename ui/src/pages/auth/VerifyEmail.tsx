import { CheckCircle, Loader2, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
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
			<div className="flex items-center justify-center min-h-[80vh] px-4 sm:px-0">
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<div className="mx-auto mb-4">
							<CheckCircle className="h-12 w-12 text-emerald-500" />
						</div>
						<CardTitle className="text-2xl">Email Verified!</CardTitle>
						<CardDescription>
							Your email has been successfully verified. You can now log in to your account.
						</CardDescription>
					</CardHeader>
					<CardContent className="text-center">
						<p className="text-sm text-muted-foreground">
							Thank you for verifying your email. You now have full access to all features.
						</p>
					</CardContent>
					<CardFooter>
						<Link to="/login" className="w-full">
							<Button className="w-full">Continue to Login</Button>
						</Link>
					</CardFooter>
				</Card>
			</div>
		)
	}

	// Error state
	return (
		<div className="flex items-center justify-center min-h-[80vh] px-4 sm:px-0">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4">
						<XCircle className="h-12 w-12 text-destructive" />
					</div>
					<CardTitle className="text-2xl">Verification Failed</CardTitle>
					<CardDescription>{errorMessage}</CardDescription>
				</CardHeader>
				<CardContent className="text-center">
					<p className="text-sm text-muted-foreground">
						Please request a new verification email from your account settings, or contact support if the
						problem persists.
					</p>
				</CardContent>
				<CardFooter className="flex flex-col gap-2">
					<Link to="/login" className="w-full">
						<Button className="w-full">Go to Login</Button>
					</Link>
				</CardFooter>
			</Card>
		</div>
	)
}
