import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
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

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			gcTime: 1000 * 60 * 60 * 24 * 7,
			staleTime: 1000 * 60 * 60,
		},
	},
})

const localStoragePersister = createAsyncStoragePersister({
	storage: window.localStorage,
	key: 'job-application-tracker-cache',
})

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
		</PersistQueryClientProvider>
	)
}

export default App
