import { Menu } from 'lucide-react'
import { type ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { AppSidebar } from './AppSidebar'
import { ThemeToggle } from './ThemeToggle'
import { Button } from './ui/button'
import { SidebarInset, SidebarProvider, useSidebar } from './ui/sidebar'

interface LayoutProps {
	children?: ReactNode
}

function Header() {
	const { toggleSidebar } = useSidebar()

	return (
		<header className="flex h-14 shrink-0 items-center border-b px-4">
			<Button
				variant="ghost"
				size="icon-sm"
				onClick={toggleSidebar}
				className="-ml-1"
				aria-label="Toggle sidebar"
			>
				<Menu className="h-5 w-5" />
			</Button>
			<div className="flex-1 flex justify-center">
				<span className="font-bold text-xl text-primary">Job Application Tracker</span>
			</div>
			<div className="w-9" /> {/* Spacer to balance the menu button */}
		</header>
	)
}

export default function Layout({ children }: LayoutProps) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<Header />
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
