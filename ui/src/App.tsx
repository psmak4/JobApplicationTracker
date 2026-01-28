import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { Suspense, lazy } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import { LoadingFallback } from './components/LoadingSpinner'
import { useSession } from './lib/auth-client'

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'))
const NewApplication = lazy(() => import('./pages/NewApplication'))
const ApplicationView = lazy(() => import('./pages/ApplicationView'))
const ApplicationEdit = lazy(() => import('./pages/ApplicationEdit'))
const Login = lazy(() => import('./pages/auth/Login'))
const Signup = lazy(() => import('./pages/auth/Signup'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			gcTime: 1000 * 60 * 60 * 24 * 7,
			staleTime: 1000 * 60 * 60,
		},
	},
})

// Wrap localStorage access in try-catch for when storage is unavailable (e.g., incognito mode)
const createSafeStorage = () => {
	try {
		// Test if localStorage is accessible
		const testKey = '__storage_test__'
		window.localStorage.setItem(testKey, testKey)
		window.localStorage.removeItem(testKey)
		return window.localStorage
	} catch {
		// Return a no-op storage when localStorage is not available
		return {
			getItem: () => null,
			setItem: () => {},
			removeItem: () => {},
		}
	}
}

const localStoragePersister = createAsyncStoragePersister({
	storage: createSafeStorage(),
	key: 'job-application-tracker-cache',
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
		<PersistQueryClientProvider
			client={queryClient}
			persistOptions={{
				persister: localStoragePersister,
				maxAge: 1000 * 60 * 60 * 24 * 7,
			}}
			onSuccess={() => {
				queryClient.resumePausedMutations()
			}}
		>
			<BrowserRouter basename="/app">
				<ErrorBoundary>
					<Suspense fallback={<LoadingFallback />}>
						<Routes>
							<Route path="/login" element={<Login />} />
							<Route path="/signup" element={<Signup />} />

							<Route
								path="/"
								element={
									<ProtectedRoute>
										<Layout />
									</ProtectedRoute>
								}
							>
								<Route index element={<Dashboard />} />
								<Route path="applications/new" element={<NewApplication />} />
								<Route path="applications/:id" element={<ApplicationView />} />
								<Route path="applications/:id/edit" element={<ApplicationEdit />} />
							</Route>

							{/* Admin Routes */}
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
		</PersistQueryClientProvider>
	)
}

export default App
