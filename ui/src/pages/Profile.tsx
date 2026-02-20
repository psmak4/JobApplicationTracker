import { useNavigate } from 'react-router-dom'
import { ChangePasswordCard } from '@/components/ChangePasswordCard'
import { LoadingFallback } from '@/components/LoadingSpinner'
import PageHeader from '@/components/PageHeader'
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
		<div className="space-y-6">
			<PageHeader title="Profile Settings" subtitle="Manage your account information" />

			<div className="flex flex-col md:flex-row gap-6 items-start">
				<ProfileFormCard user={user} />
				<ChangePasswordCard />
			</div>
		</div>
	)
}
