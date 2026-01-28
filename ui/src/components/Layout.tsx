import { AlertTriangle, Menu, Shield } from 'lucide-react'
import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { useStopImpersonating } from '@/hooks/useAdmin'
import { signOut, useSession } from '@/lib/auth-client'
import { ThemeToggle } from './ThemeToggle'
import { Button } from './ui/button'
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet'

export default function Layout() {
	const [open, setOpen] = useState(false)
	const { data: session } = useSession()
	const stopImpersonating = useStopImpersonating()

	// Check if user is admin
	const user = session?.user as { role?: string; name?: string } | undefined
	const isAdmin = user?.role === 'admin'

	// Check if currently impersonating (session has impersonatedBy field)
	const sessionData = session?.session as { impersonatedBy?: string } | undefined
	const isImpersonating = !!sessionData?.impersonatedBy

	const handleSignOut = async () => {
		await signOut({
			fetchOptions: {
				onSuccess: () => {
					window.location.href = '/'
				},
			},
		})
	}

	const handleStopImpersonating = async () => {
		await stopImpersonating.mutateAsync()
	}

	return (
		<div className="min-h-screen bg-background font-sans antialiased">
			{/* Impersonation Banner */}
			{isImpersonating && (
				<div className="bg-amber-500 text-amber-950 px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2">
					<AlertTriangle className="h-4 w-4" />
					<span>You are currently impersonating {user?.name ?? 'a user'}</span>
					<Button
						variant="outline"
						size="sm"
						onClick={handleStopImpersonating}
						className="ml-2 bg-amber-100 border-amber-300 hover:bg-amber-200 text-amber-900"
					>
						Stop Impersonating
					</Button>
				</div>
			)}

			<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
				<div className="container mx-auto px-4">
					<div className="flex h-16 items-center gap-8">
						<Link to="/" className="text-xl sm:text-2xl font-extrabold text-primary">
							Job Application Tracker
						</Link>
						<div className="hidden sm:flex grow items-center justify-between">
							<nav className="flex items-center gap-4 text-base font-medium mr-auto">
								<Link to="/" className="text-muted-foreground transition-colors hover:text-primary">
									Dashboard
								</Link>
								{isAdmin && (
									<Link
										to="/admin"
										className="text-muted-foreground transition-colors hover:text-primary flex items-center gap-1"
									>
										<Shield className="h-4 w-4" />
										Admin
									</Link>
								)}
							</nav>
							<div className="flex items-center gap-2">
								<ThemeToggle />
								<Button variant="outline" size="lg" onClick={handleSignOut} className="cursor-pointer">
									Sign Out
								</Button>
							</div>
						</div>

						<div className="flex sm:hidden items-center ml-auto gap-2">
							<ThemeToggle />
							<Sheet open={open} onOpenChange={setOpen}>
								<SheetTrigger
									render={
										<Button size="icon-lg" variant="ghost" aria-label="Open navigation menu">
											<Menu />
										</Button>
									}
								/>
								<SheetContent>
									<div className="flex flex-col gap-4 mt-14">
										<nav className="flex flex-col text-base font-medium border-t border-b">
											<Link
												to="/"
												onClick={() => setOpen(false)}
												className="p-4 text-muted-foreground transition-colors hover:text-primary font-normal hover:bg-muted"
											>
												Dashboard
											</Link>
											{isAdmin && (
												<Link
													to="/admin"
													onClick={() => setOpen(false)}
													className="p-4 text-muted-foreground transition-colors hover:text-primary font-normal hover:bg-muted flex items-center gap-2"
												>
													<Shield className="h-4 w-4" />
													Admin
												</Link>
											)}
										</nav>
										<Button
											variant="outline"
											size="lg"
											onClick={handleSignOut}
											className="cursor-pointer mx-4"
										>
											Sign Out
										</Button>
									</div>
								</SheetContent>
							</Sheet>
						</div>
					</div>
				</div>
			</header>
			<main className="container mx-auto py-6 px-4">
				<Outlet />
			</main>
		</div>
	)
}
