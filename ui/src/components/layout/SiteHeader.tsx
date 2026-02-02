import { Shield } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useStopImpersonating } from '@/hooks/useAdmin'
import { useSession } from '@/lib/auth-client'
import { MainNav } from './MainNav'
import { MobileNav } from './MobileNav'
import { UserNav } from './UserNav'

export function SiteHeader() {
	const { data: session } = useSession()
	const stopImpersonating = useStopImpersonating()

	const sessionData = session?.session as { impersonatedBy?: string } | undefined
	const isImpersonating = !!sessionData?.impersonatedBy

	const handleStopImpersonating = async () => {
		await stopImpersonating.mutateAsync()
	}

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
			<div className="container mx-auto px-2 flex h-16 items-center">
				<MobileNav />
				<MainNav />
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
					<UserNav />
				</div>
			</div>
		</header>
	)
}
