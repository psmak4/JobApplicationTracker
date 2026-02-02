import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import SiteFooter from './SiteFooter'
import { SiteHeader } from './SiteHeader'

interface LayoutProps {
	children?: ReactNode
}

export default function Layout({ children }: LayoutProps) {
	return (
		<div className="relative flex min-h-screen flex-col bg-background">
			<SiteHeader />
			<main className="flex-1">
				<div className="container mx-auto py-6 px-2">{children ?? <Outlet />}</div>
			</main>
			<SiteFooter />
		</div>
	)
}
