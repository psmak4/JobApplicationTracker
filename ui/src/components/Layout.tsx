import { Briefcase, Menu } from 'lucide-react'
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
		<header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background/95 px-4 md:px-6 backdrop-blur supports-backdrop-filter:bg-background/60">
			<div className="flex items-center gap-3">
				<Button
					variant="ghost"
					size="icon"
					onClick={toggleSidebar}
					className="-ml-2"
					aria-label="Toggle sidebar"
				>
					<Menu className="h-5 w-5" />
				</Button>
				<div className="flex items-center gap-2.5">
					<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
						<Briefcase className="h-5 w-5" />
					</div>
					<span className="text-xl font-bold tracking-tight bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-transparent hidden sm:inline-block">
						Job Application Tracker
					</span>
					<span className="text-xl font-bold tracking-tight bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-transparent sm:hidden">
						JAT
					</span>
				</div>
			</div>

			<div className="flex items-center gap-2">
				<ThemeToggle />
			</div>
		</header>
	)
}

export default function Layout({ children }: LayoutProps) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<Header />
				<main className="flex-1 p-4 md:p-6 pt-6">{children ?? <Outlet />}</main>
				<footer className="border-t px-6 py-4">
					<div className="flex items-center justify-between text-sm text-muted-foreground">
						<span>© {new Date().getFullYear()} Job Application Tracker</span>
					</div>
				</footer>
			</SidebarInset>
		</SidebarProvider>
	)
}
