import { Briefcase, Menu } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useSession } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { adminNavItems, mainNavItems } from './nav-config'

export function MobileNav() {
	const [isOpen, setIsOpen] = useState(false)
	const location = useLocation()
	const { data: session } = useSession()
	const user = session?.user as { role?: string } | undefined
	const isAdmin = user?.role === 'admin'

	return (
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
	)
}
