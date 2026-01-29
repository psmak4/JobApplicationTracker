import { Mail, Menu, Users, X } from 'lucide-react'
import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'

// Admin navigation items - add new pages here
const adminNavItems = [
	{
		to: '/admin',
		label: 'Users',
		icon: Users,
		description: 'Manage users, roles, and permissions',
	},
	{
		to: '/admin/email',
		label: 'Email Testing',
		icon: Mail,
		description: 'Test email templates',
	},
]

function AdminSidebar({ onClose }: { onClose?: () => void }) {
	const location = useLocation()

	return (
		<nav className="flex flex-col gap-1 p-4">
			<div className="px-3 py-2 mb-2">
				<h2 className="text-lg font-semibold text-foreground">Admin Panel</h2>
				<p className="text-sm text-muted-foreground">System administration</p>
			</div>
			{adminNavItems.map((item) => {
				const Icon = item.icon
				// Check if this is the active route (exact match for index, startsWith for nested)
				const isActive =
					item.to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(item.to)

				return (
					<Link
						key={item.to}
						to={item.to}
						onClick={onClose}
						className={cn(
							'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
							'hover:bg-primary/10 hover:text-primary',
							isActive ? 'bg-primary/15 text-primary' : 'text-muted-foreground',
						)}
					>
						<Icon className="h-4 w-4 shrink-0" />
						<span>{item.label}</span>
					</Link>
				)
			})}
		</nav>
	)
}

export default function AdminLayout() {
	const [sidebarOpen, setSidebarOpen] = useState(false)

	return (
		<div className="flex min-h-[calc(100vh-4rem)]">
			{/* Desktop Sidebar - always visible */}
			<aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r border-border bg-muted/30 shrink-0">
				<AdminSidebar />
			</aside>

			{/* Mobile Sidebar Overlay */}
			{sidebarOpen && (
				<div
					className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			{/* Mobile Sidebar */}
			<aside
				className={cn(
					'fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border transform transition-transform duration-300 ease-in-out lg:hidden',
					sidebarOpen ? 'translate-x-0' : '-translate-x-full',
				)}
			>
				<div className="flex items-center justify-between p-4 border-b border-border">
					<span className="text-lg font-semibold">Admin Menu</span>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setSidebarOpen(false)}
						aria-label="Close admin menu"
					>
						<X className="h-5 w-5" />
					</Button>
				</div>
				<AdminSidebar onClose={() => setSidebarOpen(false)} />
			</aside>

			{/* Main Content Area */}
			<main className="flex-1 overflow-auto">
				{/* Mobile Header with Menu Toggle */}
				<div className="lg:hidden flex items-center gap-4 p-4 border-b border-border bg-background sticky top-0 z-30">
					<Button
						variant="outline"
						size="icon"
						onClick={() => setSidebarOpen(true)}
						aria-label="Open admin menu"
					>
						<Menu className="h-5 w-5" />
					</Button>
					<span className="font-medium">Admin Panel</span>
				</div>

				{/* Page Content */}
				<div className="p-6">
					<Outlet />
				</div>
			</main>
		</div>
	)
}
