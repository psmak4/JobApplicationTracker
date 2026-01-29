import { AlertTriangle, LogOut, Menu, User } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useStopImpersonating } from '@/hooks/useAdmin'
import { signOut, useSession } from '@/lib/auth-client'
import { ThemeToggle } from './ThemeToggle'
import { Button } from './ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet'

interface LayoutProps {
	children?: ReactNode
}

export default function Layout({ children }: LayoutProps) {
	const [open, setOpen] = useState(false)
	const { data: session } = useSession()
	const stopImpersonating = useStopImpersonating()
	const navigate = useNavigate()

	// Check if user is admin
	const user = session?.user as { role?: string; name?: string; email?: string } | undefined
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
										Admin
									</Link>
								)}
							</nav>
							<div className="flex items-center gap-2">
								<ThemeToggle />
								{/* User Dropdown */}
								<DropdownMenu>
									<DropdownMenuTrigger
										render={
											<Button variant="outline" size="lg" className="gap-2">
												<User className="h-4 w-4" />
												<span className="max-w-32 truncate">{user?.name ?? 'Account'}</span>
											</Button>
										}
									/>
									<DropdownMenuContent align="end">
										<div className="px-3 py-2">
											<p className="text-sm font-medium">{user?.name}</p>
											<p className="text-xs text-muted-foreground">{user?.email}</p>
										</div>
										<DropdownMenuSeparator />
										<DropdownMenuItem onClick={() => navigate('/profile')}>
											<User className="h-4 w-4 mr-2" />
											Profile Settings
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem onClick={handleSignOut}>
											<LogOut className="h-4 w-4 mr-2" />
											Sign Out
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
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
										{/* User info */}
										<div className="px-4 py-2 border-b border-border">
											<p className="font-medium">{user?.name}</p>
											<p className="text-sm text-muted-foreground">{user?.email}</p>
										</div>

										<nav className="flex flex-col text-base font-medium border-b">
											<Link
												to="/"
												onClick={() => setOpen(false)}
												className="p-4 text-muted-foreground transition-colors hover:text-primary font-normal hover:bg-muted"
											>
												Dashboard
											</Link>
											<Link
												to="/profile"
												onClick={() => setOpen(false)}
												className="p-4 text-muted-foreground transition-colors hover:text-primary font-normal hover:bg-muted flex items-center gap-2"
											>
												<User className="h-4 w-4" />
												Profile Settings
											</Link>
											{isAdmin && (
												<Link
													to="/admin"
													onClick={() => setOpen(false)}
													className="p-4 text-muted-foreground transition-colors hover:text-primary font-normal hover:bg-muted flex items-center gap-2"
												>
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
											<LogOut className="h-4 w-4 mr-2" />
											Sign Out
										</Button>
									</div>
								</SheetContent>
							</Sheet>
						</div>
					</div>
				</div>
			</header>
			<main className={children ? '' : 'container mx-auto py-6 px-4'}>{children ?? <Outlet />}</main>
		</div>
	)
}
