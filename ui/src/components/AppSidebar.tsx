import { useQueryClient } from '@tanstack/react-query'
import { ChevronUp, Home, LogOut, Mail, PlusCircle, Shield, User, Users } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useStopImpersonating } from '@/hooks/useAdmin'
import { signOut, useSession } from '@/lib/auth-client'
import { safeLocalStorage } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from './ui/dropdown-menu'
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from './ui/sidebar'

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

export function AppSidebar() {
	const location = useLocation()
	const navigate = useNavigate()
	const { data: session } = useSession()
	const queryClient = useQueryClient()
	const stopImpersonating = useStopImpersonating()

	const user = session?.user as { role?: string; name?: string; email?: string; image?: string } | undefined
	const isAdmin = user?.role === 'admin'

	// Check if currently impersonating
	const sessionData = session?.session as { impersonatedBy?: string } | undefined
	const isImpersonating = !!sessionData?.impersonatedBy

	const handleSignOut = async () => {
		// Clear React Query cache to prevent stale data from previous user
		queryClient.clear()
		// Clear persisted localStorage cache
		safeLocalStorage.removeItem('job-application-tracker-cache')

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
		<Sidebar>
			<SidebarContent>
				{/* Main Navigation */}
				<SidebarGroup>
					<SidebarGroupLabel>Navigation</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{mainNavItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton
										isActive={location.pathname === item.url}
										render={<Link to={item.url} />}
									>
										<item.icon />
										<span>{item.title}</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{/* Admin Section - Only visible to admins */}
				{isAdmin && (
					<Collapsible defaultOpen className="group/collapsible">
						<SidebarGroup>
							<SidebarGroupLabel
								render={
									<CollapsibleTrigger className="flex w-full items-center">
										<Shield className="mr-2 size-4" />
										Admin
										<ChevronUp className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
									</CollapsibleTrigger>
								}
							/>
							<CollapsibleContent>
								<SidebarGroupContent>
									<SidebarMenu>
										{adminNavItems.map((item) => (
											<SidebarMenuItem key={item.title}>
												<SidebarMenuButton
													isActive={
														item.url === '/admin'
															? location.pathname === '/admin'
															: location.pathname.startsWith(item.url)
													}
													render={<Link to={item.url} />}
												>
													<item.icon />
													<span>{item.title}</span>
												</SidebarMenuButton>
											</SidebarMenuItem>
										))}
									</SidebarMenu>
								</SidebarGroupContent>
							</CollapsibleContent>
						</SidebarGroup>
					</Collapsible>
				)}
			</SidebarContent>

			<SidebarFooter>
				{/* Impersonation Warning */}
				{isImpersonating && (
					<div className="mx-2 mb-2 rounded-md bg-amber-500/10 p-2 text-xs text-amber-600 dark:text-amber-400">
						<p className="font-medium">Impersonating User</p>
						<button
							onClick={handleStopImpersonating}
							className="mt-1 text-amber-700 underline hover:no-underline dark:text-amber-300"
						>
							Stop Impersonating
						</button>
					</div>
				)}

				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger
								render={
									<SidebarMenuButton
										size="lg"
										className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
									>
										<Avatar className="size-8 rounded-lg">
											<AvatarImage src={user?.image || undefined} alt={user?.name || 'User'} />
											<AvatarFallback className="rounded-lg">
												{getInitials(user?.name)}
											</AvatarFallback>
										</Avatar>
										<div className="grid flex-1 text-left text-sm leading-tight">
											<span className="truncate font-semibold">{user?.name || 'User'}</span>
											<span className="truncate text-xs text-muted-foreground">
												{user?.email}
											</span>
										</div>
										<ChevronUp className="ml-auto size-4" />
									</SidebarMenuButton>
								}
							/>
							<DropdownMenuContent
								className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
								side="top"
								align="center"
								sideOffset={4}
							>
								<DropdownMenuItem onClick={() => navigate('/profile')}>
									<User className="mr-2 size-4" />
									Profile
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={handleSignOut}>
									<LogOut className="mr-2 size-4" />
									Sign out
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	)
}
