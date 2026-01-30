import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from './ui/button'

interface Props {
	title: string
	subtitle: string
	backUrl?: string
	actions?: ReactNode[]
}

const PageHeader = ({ title, subtitle, backUrl, actions }: Props) => {
	return (
		<div className="flex items-center gap-4">
			{backUrl && (
				<Button
					render={
						<Link to={backUrl}>
							<ArrowLeft className="h-4 w-4" />
						</Link>
					}
					variant="ghost"
					size="icon"
					aria-label="Back to application"
				/>
			)}
			<div>
				<h1 className="text-3xl font-bold tracking-tight">{title}</h1>
				<p className="text-muted-foreground">{subtitle}</p>
			</div>
			{actions && <div className="flex gap-2 ml-auto">{actions}</div>}
		</div>
	)
}

export default PageHeader
