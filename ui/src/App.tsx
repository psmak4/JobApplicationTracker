import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import Layout from './components/Layout'
import { useSession } from './lib/auth-client'

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'))
const NewApplication = lazy(() => import('./pages/NewApplication'))
const ApplicationView = lazy(() => import('./pages/ApplicationView'))
const ApplicationEdit = lazy(() => import('./pages/ApplicationEdit'))
const Login = lazy(() => import('./pages/auth/Login'))
const Signup = lazy(() => import('./pages/auth/Signup'))

const queryClient = new QueryClient()

function LoadingFallback() {
	return (
		<div className="flex items-center justify-center h-screen bg-background text-muted-foreground animate-pulse">
			Loading...
		</div>
	)
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const { data: session, isPending } = useSession()

	if (isPending) return <LoadingFallback />

	if (!session) return <Navigate to="/login" replace />

	return <>{children}</>
}

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<BrowserRouter basename="/app">
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
					</Routes>
				</Suspense>
			</BrowserRouter>
			<Toaster />
		</QueryClientProvider>
	)
}

export default App
