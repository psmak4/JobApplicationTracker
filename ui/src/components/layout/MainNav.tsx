import { Briefcase } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { useSession } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { AdminNav } from './AdminNav'
import { mainNavItems } from './nav-config'

export function MainNav() {
	const location = useLocation()
	const { data: session } = useSession()
	const user = session?.user as { role?: string } | undefined
	const isAdmin = user?.role === 'admin'

	return (
		<div className="mr-4 hidden md:flex">
			<Link to="/" className="mr-6 flex items-center gap-2">
				<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
					<Briefcase className="h-4 w-4" />
				</div>
				<span className="hidden font-bold font-heading text-2xl sm:inline-block">Job Application Tracker</span>
			</Link>
			<NavigationMenu>
				<NavigationMenuList>
					{mainNavItems.map((item) => (
						<NavigationMenuItem key={item.url}>
							<NavigationMenuLink
								render={
									<Link
										to={item.url}
										className={cn(
											navigationMenuTriggerStyle(),
											'text-lg transition-colors hover:text-foreground/80',
											location.pathname === item.url
												? 'text-foreground font-bold'
												: 'text-foreground/60',
										)}
									>
										{item.title}
									</Link>
								}
							/>
						</NavigationMenuItem>
					))}
					{isAdmin && <AdminNav />}
				</NavigationMenuList>
			</NavigationMenu>
		</div>
	)
}
