import { useQueryClient } from '@tanstack/react-query'
import { LogOut, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useStopImpersonating } from '@/hooks/useAdmin'
import { signOut, useSession } from '@/lib/auth-client'

export function UserNav() {
	const navigate = useNavigate()
	const { data: session } = useSession()
	const queryClient = useQueryClient()
	const stopImpersonating = useStopImpersonating()

	const user = session?.user as { role?: string; name?: string; email?: string; image?: string } | undefined
	const sessionData = session?.session as { impersonatedBy?: string } | undefined
	const isImpersonating = !!sessionData?.impersonatedBy

	const handleSignOut = async () => {
		// Clear React Query cache to prevent stale data from previous user
		queryClient.clear()

		await signOut({
			fetchOptions: {
				onSuccess: () => {
					window.location.href = '/'
				},
			},
		})
	}

	const handleStopImpersonating = async () => {
		await stopImpersonating.mutateAsync()
	}

	const getInitials = (name?: string) => {
		if (!name) return 'U'
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2)
	}

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger
				render={
					<Button variant="outline" size="icon">
						<Avatar className="h-8 w-8">
							<AvatarImage src={user?.image || undefined} alt={user?.name || 'User'} />
							<AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
						</Avatar>
					</Button>
				}
			/>
			<DropdownMenuContent className="w-56" align="end">
				<DropdownMenuGroup>
					<DropdownMenuLabel className="font-normal">
						<div className="flex flex-col space-y-1">
							<p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
							<p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
						</div>
					</DropdownMenuLabel>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem onClick={() => navigate('/profile')}>
						<User className="mr-2 h-4 w-4" />
						Profile
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					{isImpersonating && (
						<>
							<DropdownMenuItem onClick={handleStopImpersonating} className="text-amber-600">
								<LogOut className="mr-2 h-4 w-4" />
								Stop Impersonating
							</DropdownMenuItem>
							<DropdownMenuSeparator />
						</>
					)}
					<DropdownMenuItem onClick={handleSignOut}>
						<LogOut className="mr-2 h-4 w-4" />
						Log out
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
