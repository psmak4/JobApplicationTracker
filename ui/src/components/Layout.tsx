import { type ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { AppSidebar } from './AppSidebar'
import { ThemeToggle } from './ThemeToggle'
import { SidebarInset, SidebarProvider, SidebarTrigger } from './ui/sidebar'

interface LayoutProps {
	children?: ReactNode
}

export default function Layout({ children }: LayoutProps) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
					<SidebarTrigger className="-ml-1" />
				</header>
				<main className="flex-1 p-4 md:p-6">{children ?? <Outlet />}</main>
				<footer className="border-t px-4 py-3">
					<div className="flex items-center justify-between text-sm text-muted-foreground">
						<span>© {new Date().getFullYear()} Job Application Tracker</span>
						<div className="flex items-center gap-2">
							<span className="text-xs">Theme</span>
							<ThemeToggle />
						</div>
					</div>
				</footer>
			</SidebarInset>
		</SidebarProvider>
	)
}
