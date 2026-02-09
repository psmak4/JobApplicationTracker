import { Archive, Home, Kanban, Users } from 'lucide-react'

export const mainNavItems = [
	{
		title: 'Dashboard',
		url: '/',
		icon: Home,
	},
	{
		title: 'Pipeline',
		url: '/pipeline',
		icon: Kanban,
	},
	{
		title: 'Archive',
		url: '/archive',
		icon: Archive,
	},
]

export const adminNavItems = [
	{
		title: 'Users',
		url: '/admin',
		icon: Users,
	},
]
