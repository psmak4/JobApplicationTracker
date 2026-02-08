import { Home, Kanban, PlusCircle, Users } from 'lucide-react'

export const mainNavItems = [
	{
		title: 'Dashboard',
		url: '/',
		icon: Home,
	},
	{
		title: 'Application Pipeline',
		url: '/pipeline',
		icon: Kanban,
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
]
