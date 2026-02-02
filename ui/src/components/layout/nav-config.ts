import { Home, Mail, PlusCircle, Users } from 'lucide-react'

export const mainNavItems = [
	{
		title: 'Dashboard',
		url: '/',
		icon: Home,
	},
	{
		title: 'New Application',
		url: '/new',
		icon: PlusCircle,
	},
]

export const adminNavItems = [
	{
		title: 'Users',
		url: '/admin',
		icon: Users,
	},
	{
		title: 'Email Testing',
		url: '/admin/email',
		icon: Mail,
	},
]
