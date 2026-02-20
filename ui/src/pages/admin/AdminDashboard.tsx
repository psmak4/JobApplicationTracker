import {
	Ban,
	Crown,
	LogIn,
	MoreHorizontal,
	RefreshCcw,
	Search,
	Shield,
	ShieldOff,
	Trash2,
	User,
	UserX,
} from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import PageHeader from '@/components/PageHeader'
import { QueryError } from '@/components/QueryState'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import type { AdminUser } from '@/hooks/useAdmin'
import {
	useAdminUsers,
	useBanUser,
	useImpersonateUser,
	useRemoveUser,
	useSetUserRole,
	useUnbanUser,
} from '@/hooks/useAdmin'
import { formatDate } from '@/lib/utils'

// Memoized user row component for performance
const UserRow = React.memo(function UserRow({
	user,
	onBan,
	onUnban,
	onSetRole,
	onImpersonate,
	onRemove,
}: {
	user: AdminUser
	onBan: (userId: string) => void
	onUnban: (userId: string) => void
	onSetRole: (userId: string, role: 'user' | 'admin') => void
	onImpersonate: (userId: string) => void
	onRemove: (userId: string) => void
}) {
	const isAdmin = user.role === 'admin'
	const isBanned = user.banned

	return (
		<tr className="border-b border-border hover:bg-muted/50 transition-colors">
			<td className="py-4 px-4">
				<div className="flex items-center gap-3">
					<div className="h-10 w-10 rounded-full bg-linear-to-br from-primary/30 to-primary/10 flex items-center justify-center">
						{user.image ? (
							<img src={user.image} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
						) : (
							<User className="h-5 w-5 text-primary" />
						)}
					</div>
					<div>
						<p className="font-medium">{user.name}</p>
						<p className="text-sm text-muted-foreground">{user.email}</p>
					</div>
				</div>
			</td>
			<td className="py-4 px-4">
				<div className="flex items-center gap-2">
					{isAdmin ? (
						<Badge variant="default" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
							<Crown className="h-3 w-3 mr-1" />
							Admin
						</Badge>
					) : (
						<Badge variant="secondary">
							<User className="h-3 w-3 mr-1" />
							User
						</Badge>
					)}
					{isBanned && (
						<Badge variant="destructive">
							<Ban className="h-3 w-3 mr-1" />
							Banned
						</Badge>
					)}
				</div>
			</td>
			<td className="py-4 px-4">
				<div className="flex items-center gap-1">
					{user.emailVerified ? (
						<Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
							Verified
						</Badge>
					) : (
						<Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30">
							Unverified
						</Badge>
					)}
				</div>
			</td>
			<td className="py-4 px-4 text-sm text-muted-foreground">{formatDate(user.createdAt, 'short')}</td>
			<td className="py-4 px-4">
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button variant="ghost" size="icon" aria-label={`Actions for ${user.name}`}>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						}
					/>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={() => onImpersonate(user.id)}>
							<LogIn className="h-4 w-4 mr-2" />
							Impersonate
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						{isAdmin ? (
							<DropdownMenuItem onClick={() => onSetRole(user.id, 'user')}>
								<ShieldOff className="h-4 w-4 mr-2" />
								Remove Admin
							</DropdownMenuItem>
						) : (
							<DropdownMenuItem onClick={() => onSetRole(user.id, 'admin')}>
								<Shield className="h-4 w-4 mr-2" />
								Make Admin
							</DropdownMenuItem>
						)}
						<DropdownMenuSeparator />
						{isBanned ? (
							<DropdownMenuItem onClick={() => onUnban(user.id)}>
								<UserX className="h-4 w-4 mr-2" />
								Unban User
							</DropdownMenuItem>
						) : (
							<DropdownMenuItem onClick={() => onBan(user.id)} className="text-orange-600">
								<Ban className="h-4 w-4 mr-2" />
								Ban User
							</DropdownMenuItem>
						)}
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => onRemove(user.id)} className="text-destructive">
							<Trash2 className="h-4 w-4 mr-2" />
							Delete User
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</td>
		</tr>
	)
})

export default function AdminDashboard() {
	const [searchValue, setSearchValue] = useState('')
	const [page, setPage] = useState(0)
	const [confirmDialog, setConfirmDialog] = useState<{
		open: boolean
		type: 'ban' | 'remove' | 'role' | null
		userId: string
		role?: 'user' | 'admin'
	}>({ open: false, type: null, userId: '' })

	const pageSize = 20

	const { data, isLoading, error, refetch } = useAdminUsers({
		limit: pageSize,
		offset: page * pageSize,
		searchValue: searchValue || undefined,
		searchField: 'name',
	})

	const banUser = useBanUser()
	const unbanUser = useUnbanUser()
	const setUserRole = useSetUserRole()
	const impersonateUser = useImpersonateUser()
	const removeUser = useRemoveUser()

	const handleBan = (userId: string) => {
		setConfirmDialog({ open: true, type: 'ban', userId })
	}

	const handleUnban = async (userId: string) => {
		try {
			await unbanUser.mutateAsync({ userId })
			toast.success('User unbanned successfully')
		} catch {
			toast.error('Failed to unban user')
		}
	}

	const handleSetRole = (userId: string, role: 'user' | 'admin') => {
		setConfirmDialog({ open: true, type: 'role', userId, role })
	}

	const handleImpersonate = async (userId: string) => {
		try {
			await impersonateUser.mutateAsync({ userId })
			toast.success('Now impersonating user')
		} catch {
			toast.error('Failed to impersonate user')
		}
	}

	const handleRemove = (userId: string) => {
		setConfirmDialog({ open: true, type: 'remove', userId })
	}

	const confirmAction = async () => {
		const { type, userId, role } = confirmDialog

		try {
			if (type === 'ban') {
				await banUser.mutateAsync({ userId })
				toast.success('User banned successfully')
			} else if (type === 'remove') {
				await removeUser.mutateAsync({ userId })
				toast.success('User deleted successfully')
			} else if (type === 'role' && role) {
				await setUserRole.mutateAsync({ userId, role })
				toast.success(`User role updated to ${role}`)
			}
		} catch {
			toast.error('Action failed')
		}

		setConfirmDialog({ open: false, type: null, userId: '' })
	}

	const totalPages = data ? Math.ceil(data.total / pageSize) : 0

	if (error) {
		return (
			<QueryError
				error={error}
				title="Failed to load users"
				message="You may not have admin access."
				onRetry={() => refetch()}
			/>
		)
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<PageHeader title="User Management" subtitle="Manage users, roles, and permissions" />

			{/* Stats Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Total Users</CardDescription>
						<CardTitle className="text-3xl">{data?.total ?? '-'}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Admins</CardDescription>
						<CardTitle className="text-3xl">
							{data?.users.filter((u) => u.role === 'admin').length ?? '-'}
						</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Banned</CardDescription>
						<CardTitle className="text-3xl">{data?.users.filter((u) => u.banned).length ?? '-'}</CardTitle>
					</CardHeader>
				</Card>
			</div>

			{/* Users Table */}
			<Card>
				<CardHeader>
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div>
							<CardTitle>Users</CardTitle>
							<CardDescription>A list of all registered users</CardDescription>
						</div>
						<div className="flex items-center gap-2">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search users..."
									value={searchValue}
									onChange={(e) => {
										setSearchValue(e.target.value)
										setPage(0)
									}}
									className="pl-9 w-64"
								/>
							</div>
							<Button variant="outline" size="icon" onClick={() => refetch()} aria-label="Refresh users">
								<RefreshCcw className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex justify-center py-12">
							<LoadingSpinner />
						</div>
					) : (
						<>
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead>
										<tr className="border-b border-border text-left">
											<th className="py-3 px-4 text-sm font-medium text-muted-foreground">
												User
											</th>
											<th className="py-3 px-4 text-sm font-medium text-muted-foreground">
												Role
											</th>
											<th className="py-3 px-4 text-sm font-medium text-muted-foreground">
												Status
											</th>
											<th className="py-3 px-4 text-sm font-medium text-muted-foreground">
												Joined
											</th>
											<th className="py-3 px-4 text-sm font-medium text-muted-foreground">
												Actions
											</th>
										</tr>
									</thead>
									<tbody>
										{data?.users.map((user) => (
											<UserRow
												key={user.id}
												user={user}
												onBan={handleBan}
												onUnban={handleUnban}
												onSetRole={handleSetRole}
												onImpersonate={handleImpersonate}
												onRemove={handleRemove}
											/>
										))}
									</tbody>
								</table>
							</div>

							{/* Pagination */}
							{totalPages > 1 && (
								<div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
									<p className="text-sm text-muted-foreground">
										Page {page + 1} of {totalPages} ({data?.total} users)
									</p>
									<div className="flex gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => setPage((p) => Math.max(0, p - 1))}
											disabled={page === 0}
										>
											Previous
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
											disabled={page >= totalPages - 1}
										>
											Next
										</Button>
									</div>
								</div>
							)}
						</>
					)}
				</CardContent>
			</Card>

			{/* Confirmation Dialog */}
			<AlertDialog
				open={confirmDialog.open}
				onOpenChange={(open) => !open && setConfirmDialog({ open: false, type: null, userId: '' })}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{confirmDialog.type === 'ban' && 'Ban User'}
							{confirmDialog.type === 'remove' && 'Delete User'}
							{confirmDialog.type === 'role' && `Change Role to ${confirmDialog.role}`}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{confirmDialog.type === 'ban' &&
								'This will prevent the user from signing in and revoke all their sessions.'}
							{confirmDialog.type === 'remove' &&
								'This action cannot be undone. This will permanently delete the user and all their data.'}
							{confirmDialog.type === 'role' && `Are you sure you want to change this user's role?`}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmAction}
							className={confirmDialog.type === 'remove' ? 'bg-destructive hover:bg-destructive/90' : ''}
						>
							Confirm
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
