import { useNavigate } from 'react-router-dom'
import { ChangePasswordCard } from '@/components/ChangePasswordCard'
import { LoadingFallback } from '@/components/LoadingSpinner'
import { ProfileFormCard } from '@/components/ProfileFormCard'
import { useSession } from '@/lib/auth-client'

export default function Profile() {
	const navigate = useNavigate()
	const { data: session, isPending } = useSession()

	const user = session?.user as {
		id: string
		name: string
		email: string
		image?: string | null
		createdAt: Date
	} | null

	if (isPending) {
		return <LoadingFallback />
	}

	if (!user) {
		navigate('/login')
		return null
	}

	return (
		<div className="max-w-2xl mx-auto space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold">Profile Settings</h1>
				<p className="text-muted-foreground">Manage your account information</p>
			</div>

			{/* Profile Information */}
			<ProfileFormCard user={user} />

			{/* Password Management */}
			<ChangePasswordCard />
		</div>
	)
}
