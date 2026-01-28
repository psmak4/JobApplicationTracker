import { Menu } from 'lucide-react'
import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { signOut } from '@/lib/auth-client'
import { Button } from './ui/button'
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet'

export default function Layout() {
	const [open, setOpen] = useState(false)

	const handleSignOut = async () => {
		await signOut({
			fetchOptions: {
				onSuccess: () => {
					window.location.href = '/'
				},
			},
		})
	}

	return (
		<div className="min-h-screen bg-background font-sans antialiased">
			<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
				<div className="container mx-auto px-4">
					<div className="flex h-16 items-center gap-8">
						<Link to="/" className="text-xl sm:text-2xl font-extrabold text-primary">
							Job Application Tracker
						</Link>
						<div className="hidden sm:flex grow items-center justify-between">
							<nav className="flex items-center gap-4 text-base font-medium mr-auto">
								<Link to="/" className="text-muted-foreground transition-colors hover:text-primary">
									Dashboard
								</Link>
							</nav>
							<Button variant="outline" size="lg" onClick={handleSignOut} className="cursor-pointer">
								Sign Out
							</Button>
						</div>

						<div className="flex sm:hidden items-center ml-auto">
							<Sheet open={open} onOpenChange={setOpen}>
								<SheetTrigger
									render={
										<Button size="icon-lg" variant="ghost" aria-label="Open navigation menu">
											<Menu />
										</Button>
									}
								/>
								<SheetContent>
									<div className="flex flex-col gap-4 mt-14">
										<nav className="flex flex-col text-base font-medium border-t border-b">
											<Link
												to="/"
												onClick={() => setOpen(false)}
												className="p-4 text-muted-foreground transition-colors hover:text-primary font-normal hover:bg-muted"
											>
												Dashboard
											</Link>
										</nav>
										<Button
											variant="outline"
											size="lg"
											onClick={handleSignOut}
											className="cursor-pointer mx-4"
										>
											Sign Out
										</Button>
									</div>
								</SheetContent>
							</Sheet>
						</div>
					</div>
				</div>
			</header>
			<main className="container mx-auto py-6 px-4">
				<Outlet />
			</main>
		</div>
	)
}
