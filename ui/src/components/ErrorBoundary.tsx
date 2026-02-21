import * as Sentry from '@sentry/react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from './ui/button'

interface Props {
	children: ReactNode
	fallback?: ReactNode
}

/**
 * Functional Error Boundary wrapper using Sentry's tracking infrastructure.
 * Prevents the app from crashing and displays a fallback UI when a child throws.
 */
export function ErrorBoundary({ children, fallback }: Props) {
	const handleReload = () => {
		window.location.reload()
	}

	return (
		<Sentry.ErrorBoundary
			fallback={({ error, resetError }) => {
				if (fallback) return <>{fallback}</>

				// Sentry types error as unknown
				const errMessage = error instanceof Error ? error.message : String(error)

				return (
					<div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
						<div className="p-4 bg-destructive/10 rounded-full mb-6">
							<AlertTriangle className="h-12 w-12 text-destructive" />
						</div>
						<h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
						<p className="text-muted-foreground mb-6 max-w-md">
							An unexpected error occurred. Please try again or refresh the page.
						</p>
						{import.meta.env.DEV && errMessage && (
							<pre className="text-left text-xs bg-muted p-4 rounded-lg mb-6 max-w-lg overflow-auto">
								{errMessage}
							</pre>
						)}
						<div className="flex gap-4">
							<Button variant="outline" onClick={resetError}>
								Try Again
							</Button>
							<Button onClick={handleReload}>
								<RefreshCw className="h-4 w-4 mr-2" />
								Refresh Page
							</Button>
						</div>
					</div>
				)
			}}
		>
			{children}
		</Sentry.ErrorBoundary>
	)
}

export default ErrorBoundary
