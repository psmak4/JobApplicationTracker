import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { buttonVariants } from './ui/button'

interface Props {
	size?: 'sm' | 'lg' | 'default' | 'xs' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg' | null | undefined
}

export default function NewApplicationLink({ size = 'sm' }: Props) {
	return (
		<Link
			to="/new"
			className={cn(
				buttonVariants({ variant: 'default', size }),
				'flex items-center gap-2 group',
				'bg-linear-to-r from-primary to-amber-500',
				'hover:from-primary-hover hover:to-amber-400',
				'shadow-md hover:shadow-lg shadow-primary/20',
				'transition-all duration-200',
				'border-0',
				'text-primary-foreground',
			)}
			aria-label="Create new application"
		>
			<Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
			New Application
		</Link>
	)
}
