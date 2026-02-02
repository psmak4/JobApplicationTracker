import { ChevronDown } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { adminNavItems } from './nav-config'

export function AdminNav() {
	const location = useLocation()

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger
				render={
					<button
						className={cn(
							'flex items-center gap-1 transition-colors hover:text-foreground/80 outline-none',
							location.pathname.startsWith('/admin') ? 'text-foreground' : 'text-foreground/60',
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
	)
}
