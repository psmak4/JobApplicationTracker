// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { isAxiosError } from 'axios'
import { Suspense, lazy } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import ErrorBoundary from './components/ErrorBoundary'
import { LoadingFallback } from './components/LoadingSpinner'
import Layout from './components/layout/Layout'
import { useSession } from './lib/auth-client'

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'))
const JobBoard = lazy(() => import('./pages/Pipeline'))
const NewApplication = lazy(() => import('./pages/NewApplication'))
const ApplicationView = lazy(() => import('./pages/ApplicationView'))
const ApplicationEdit = lazy(() => import('./pages/ApplicationEdit'))
const Login = lazy(() => import('./pages/auth/Login'))
const Signup = lazy(() => import('./pages/auth/Signup'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'))
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const Profile = lazy(() => import('./pages/Profile'))

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			gcTime: 1000 * 60 * 60 * 24 * 7,
			staleTime: 1000 * 60 * 60,
			retry: (failureCount, error) => {
				// Stop after 3 retries
				if (failureCount >= 3) return false

				if (isAxiosError(error)) {
					// Always retry on network errors (no response)
					if (!error.response) return true

					const status = error.response.status
					// Retry on Rate Limit (429) or Server Errors (5xx)
					if (status === 429 || status >= 500) return true

					// Don't retry other Client Errors (4xx)
					return false
				}

				// Retry other types of errors (e.g. network timeout not caught by axios)
				return true
			},
			retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
		},
	},
})

function NotFound() {
	return (
		<div className="flex flex-col items-center justify-center h-screen bg-background text-center px-4">
			<h1 className="text-6xl font-bold text-muted-foreground mb-4">404</h1>
			<p className="text-xl text-muted-foreground mb-8">Page not found</p>
			<Link to="/" className="text-primary hover:underline">
				Go back to Dashboard
			</Link>
		</div>
	)
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const { data: session, isPending } = useSession()

	if (isPending) return <LoadingFallback />

	if (!session) return <Navigate to="/login" replace />

	return <>{children}</>
}

function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
	const { data: session, isPending } = useSession()

	if (isPending) return <LoadingFallback />

	if (!session) return <Navigate to="/login" replace />

	// Check if user has admin role
	const user = session.user as { role?: string } | undefined
	if (user?.role !== 'admin') {
		return (
			<div className="flex flex-col items-center justify-center h-screen bg-background text-center px-4">
				<h1 className="text-6xl font-bold text-destructive mb-4">403</h1>
				<p className="text-xl text-muted-foreground mb-8">Access Denied</p>
				<p className="text-muted-foreground mb-8">You need admin privileges to access this page.</p>
				<Link to="/" className="text-primary hover:underline">
					Go back to Dashboard
				</Link>
			</div>
		)
	}

	return <>{children}</>
}

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<BrowserRouter basename="/app">
				<ErrorBoundary>
					<Suspense fallback={<LoadingFallback />}>
						<Routes>
							<Route path="/login" element={<Login />} />
							<Route path="/signup" element={<Signup />} />
							<Route path="/forgot-password" element={<ForgotPassword />} />
							<Route path="/reset-password" element={<ResetPassword />} />
							<Route path="/verify-email" element={<VerifyEmail />} />

							<Route
								path="/"
								element={
									<ProtectedRoute>
										<Layout />
									</ProtectedRoute>
								}
							>
								<Route index element={<Dashboard />} />
								<Route path="pipeline" element={<JobBoard />} />
								<Route path="new" element={<NewApplication />} />
								<Route path="profile" element={<Profile />} />
								<Route path="applications/:id" element={<ApplicationView />} />
								<Route path="applications/:id/edit" element={<ApplicationEdit />} />
							</Route>

							{/* Admin Routes - Uses main layout with sidebar */}
							<Route
								path="/admin"
								element={
									<AdminProtectedRoute>
										<Layout />
									</AdminProtectedRoute>
								}
							>
								<Route index element={<AdminDashboard />} />
							</Route>

							{/* Catch-all route for 404 */}
							<Route path="*" element={<NotFound />} />
						</Routes>
					</Suspense>
				</ErrorBoundary>
			</BrowserRouter>
			<Toaster position="bottom-right" richColors />
			<ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
		</QueryClientProvider>
	)
}

export default App
