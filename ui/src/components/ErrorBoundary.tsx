import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from './ui/button'

interface Props {
	children: ReactNode
	fallback?: ReactNode
}

interface State {
	hasError: boolean
	error: Error | null
}

/**
 * Error Boundary component to catch React errors and display a fallback UI.
 * Prevents the entire app from crashing when a component throws an error.
 */
export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props)
		this.state = { hasError: false, error: null }
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error }
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error('ErrorBoundary caught an error:', error, errorInfo)
	}

	handleReset = () => {
		this.setState({ hasError: false, error: null })
	}

	handleReload = () => {
		window.location.reload()
	}

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback
			}

			return (
				<div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
					<div className="p-4 bg-destructive/10 rounded-full mb-6">
						<AlertTriangle className="h-12 w-12 text-destructive" />
					</div>
					<h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
					<p className="text-muted-foreground mb-6 max-w-md">
						An unexpected error occurred. Please try again or refresh the page.
					</p>
					{import.meta.env.DEV && this.state.error && (
						<pre className="text-left text-xs bg-muted p-4 rounded-lg mb-6 max-w-lg overflow-auto">
							{this.state.error.message}
						</pre>
					)}
					<div className="flex gap-4">
						<Button variant="outline" onClick={this.handleReset}>
							Try Again
						</Button>
						<Button onClick={this.handleReload}>
							<RefreshCw className="h-4 w-4 mr-2" />
							Refresh Page
						</Button>
					</div>
				</div>
			)
		}

		return this.props.children
	}
}

export default ErrorBoundary
