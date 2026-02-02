import { useQueryClient } from '@tanstack/react-query'
import { Briefcase, ChevronDown, Home, LogOut, Mail, Menu, PlusCircle, Shield, User, Users } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useStopImpersonating } from '@/hooks/useAdmin'
import { signOut, useSession } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

interface LayoutProps {
	children?: ReactNode
}

// Main navigation items
const mainNavItems = [
	{
		title: 'Dashboard',
		url: '/',
		icon: Home,
	},
	{
		title: 'New Application',
		url: '/new',
		icon: PlusCircle,
	},
]

// Admin navigation items
const adminNavItems = [
	{
		title: 'Users',
		url: '/admin',
		icon: Users,
	},
	{
		title: 'Email Testing',
		url: '/admin/email',
		icon: Mail,
	},
]

function Header() {
	const location = useLocation()
	const navigate = useNavigate()
	const { data: session } = useSession()
	const queryClient = useQueryClient()
	const stopImpersonating = useStopImpersonating()
	const [isOpen, setIsOpen] = useState(false)

	const user = session?.user as { role?: string; name?: string; email?: string; image?: string } | undefined
	const isAdmin = user?.role === 'admin'

	// Check if currently impersonating
	const sessionData = session?.session as { impersonatedBy?: string } | undefined
	const isImpersonating = !!sessionData?.impersonatedBy

	const handleSignOut = async () => {
		// Clear React Query cache to prevent stale data from previous user
		queryClient.clear()

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

	// Get user initials for avatar fallback
	const getInitials = (name?: string) => {
		if (!name) return 'U'
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2)
	}

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
			<div className="container mx-auto flex h-16 items-center">
				{/* Mobile Menu */}
				<Sheet open={isOpen} onOpenChange={setIsOpen}>
					<SheetTrigger
						render={
							<Button variant="ghost" size="icon" className="mr-2 md:hidden">
								<Menu className="h-5 w-5" />
								<span className="sr-only">Toggle Menu</span>
							</Button>
						}
					/>
					<SheetContent side="left" className="pr-0">
						<SheetHeader className="px-6">
							<SheetTitle className="flex items-center gap-2">
								<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
									<Briefcase className="h-4 w-4" />
								</div>
								<span className="font-bold">Job Application Tracker</span>
							</SheetTitle>
						</SheetHeader>
						<div className="flex flex-col gap-4 p-6">
							{mainNavItems.map((item) => (
								<Link
									key={item.url}
									to={item.url}
									onClick={() => setIsOpen(false)}
									className={cn(
										'flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary',
										location.pathname === item.url ? 'text-primary' : 'text-muted-foreground',
									)}
								>
									<item.icon className="h-4 w-4" />
									{item.title}
								</Link>
							))}
							{isAdmin && (
								<>
									<div className="my-2 border-t" />
									<div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
										Admin
									</div>
									{adminNavItems.map((item) => (
										<Link
											key={item.url}
											to={item.url}
											onClick={() => setIsOpen(false)}
											className={cn(
												'flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary',
												location.pathname.startsWith(item.url)
													? 'text-primary'
													: 'text-muted-foreground',
											)}
										>
											<item.icon className="h-4 w-4" />
											{item.title}
										</Link>
									))}
								</>
							)}
						</div>
					</SheetContent>
				</Sheet>

				{/* Logo / Brand */}
				<div className="mr-4 hidden md:flex">
					<Link to="/" className="mr-6 flex items-center gap-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
							<Briefcase className="h-4 w-4" />
						</div>
						<span className="hidden font-bold sm:inline-block">Job Application Tracker</span>
					</Link>
					<nav className="flex items-center gap-6 text-sm font-medium">
						{mainNavItems.map((item) => (
							<Link
								key={item.url}
								to={item.url}
								className={cn(
									'transition-colors hover:text-foreground/80',
									location.pathname === item.url ? 'text-foreground' : 'text-foreground/60',
								)}
							>
								{item.title}
							</Link>
						))}
						{isAdmin && (
							<DropdownMenu modal={false}>
								<DropdownMenuTrigger
									render={
										<button
											className={cn(
												'flex items-center gap-1 transition-colors hover:text-foreground/80 outline-none',
												location.pathname.startsWith('/admin')
													? 'text-foreground'
													: 'text-foreground/60',
											)}
										>
											Admin <ChevronDown className="h-3 w-3" />
										</button>
									}
								/>
								<DropdownMenuContent align="start">
									{adminNavItems.map((item) => (
										<DropdownMenuItem
											key={item.url}
											render={
												<Link to={item.url} className="w-full">
													{item.title}
												</Link>
											}
										/>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</nav>
				</div>

				{/* Mobile Brand (Centered if needed, or left next to hamburger) */}
				{/* <div className="flex flex-1 items-center gap-2 md:hidden">
					<span className="font-bold">Job Tracker</span>
				</div> */}

				{/* Right Side Actions */}
				<div className="flex flex-1 items-center justify-end gap-2">
					{isImpersonating && (
						<div className="hidden md:flex items-center gap-2 mr-4 rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-600 dark:text-amber-400 border border-amber-500/20">
							<Shield className="h-3 w-3" />
							<span className="font-medium">Impersonating</span>
							<button onClick={handleStopImpersonating} className="ml-1 underline hover:no-underline">
								Stop
							</button>
						</div>
					)}

					<ThemeToggle />

					<DropdownMenu modal={false}>
						<DropdownMenuTrigger
							render={
								<Button variant="outline" size="icon">
									<Avatar className="h-8 w-8">
										<AvatarImage src={user?.image || undefined} alt={user?.name || 'User'} />
										<AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
									</Avatar>
								</Button>
							}
						/>
						<DropdownMenuContent className="w-56" align="end">
							<DropdownMenuGroup>
								<DropdownMenuLabel className="font-normal">
									<div className="flex flex-col space-y-1">
										<p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
										<p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
									</div>
								</DropdownMenuLabel>
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuItem onClick={() => navigate('/profile')}>
									<User className="mr-2 h-4 w-4" />
									Profile
								</DropdownMenuItem>
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								{isImpersonating && (
									<>
										<DropdownMenuItem onClick={handleStopImpersonating} className="text-amber-600">
											<LogOut className="mr-2 h-4 w-4" />
											Stop Impersonating
										</DropdownMenuItem>
										<DropdownMenuSeparator />
									</>
								)}
								<DropdownMenuItem onClick={handleSignOut}>
									<LogOut className="mr-2 h-4 w-4" />
									Log out
								</DropdownMenuItem>
							</DropdownMenuGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	)
}

export default function Layout({ children }: LayoutProps) {
	return (
		<div className="relative flex min-h-screen flex-col bg-background">
			<Header />
			<main className="flex-1">
				<div className="container mx-auto py-6">{children ?? <Outlet />}</div>
			</main>
			<footer className="border-t py-6 md:py-0">
				<div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
					<p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
						© {new Date().getFullYear()} Job Application Tracker. All rights reserved.
					</p>
				</div>
			</footer>
		</div>
	)
}
