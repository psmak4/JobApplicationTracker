import { useMemo } from 'react'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { getErrorMessage, isAxiosError } from '@/lib/error-utils'

interface QueryLoadingProps {
	text?: string
}

interface QueryErrorProps {
	error?: unknown
	title?: string
	message?: string
	onRetry?: () => void
	retryLabel?: string
}

export function QueryLoading({ text = 'Loading...' }: QueryLoadingProps) {
	return (
		<div className="p-8 flex items-center justify-center">
			<LoadingSpinner text={text} />
		</div>
	)
}

function resolveErrorMessage(error: unknown, fallback: string) {
	if (isAxiosError(error)) {
		const status = error.response?.status
		if (status === 401) return 'Authentication required. Please log in.'
		if (status === 403) return 'You do not have access to this content.'
		if (status === 404) return 'We could not find what you were looking for.'
	}

	return getErrorMessage(error, fallback)
}

export function QueryError({
	error,
	title = 'Something went wrong',
	message,
	onRetry,
	retryLabel = 'Retry',
}: QueryErrorProps) {
	const resolvedMessage = useMemo(() => {
		if (message) return message
		return resolveErrorMessage(error, 'Please try again.')
	}, [error, message])

	return (
		<div className="p-8 flex flex-col items-center justify-center text-center gap-4">
			<div>
				<h3 className="text-lg font-semibold">{title}</h3>
				<p className="text-sm text-muted-foreground mt-1">{resolvedMessage}</p>
			</div>
			{onRetry && (
				<Button variant="outline" onClick={onRetry}>
					{retryLabel}
				</Button>
			)}
		</div>
	)
}
