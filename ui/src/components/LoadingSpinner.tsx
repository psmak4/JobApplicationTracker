import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
	className?: string
	text?: string
	size?: 'sm' | 'md' | 'lg'
	fullScreen?: boolean
}

const sizeClasses = {
	sm: 'h-4 w-4',
	md: 'h-8 w-8',
	lg: 'h-12 w-12',
}

/**
 * Polished loading spinner component with optional text and full-screen mode.
 */
export function LoadingSpinner({ className, text = 'Loading...', size = 'md', fullScreen = false }: Props) {
	const content = (
		<div className={cn('flex flex-col items-center justify-center gap-4', className)}>
			<div className="relative">
				<div className="absolute inset-0 rounded-full bg-primary/20 blur-lg" />
				<Loader2 className={cn('animate-spin text-primary relative', sizeClasses[size])} />
			</div>
			{text && <p className="text-muted-foreground text-sm animate-pulse">{text}</p>}
		</div>
	)

	if (fullScreen) {
		return <div className="flex items-center justify-center h-screen bg-background">{content}</div>
	}

	return content
}

/**
 * Full-page loading fallback for Suspense and route transitions.
 */
export function LoadingFallback() {
	return <LoadingSpinner fullScreen size="lg" text="Loading..." />
}

export default LoadingSpinner
