import type React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'

interface AuthPageLayoutProps {
	children: React.ReactNode
	title: string
	description: string
	footer?: React.ReactNode
	onSubmit?: (e: React.FormEvent) => void
}

/**
 * Shared layout wrapper for authentication pages (Login, Signup, ForgotPassword, etc.)
 * Provides consistent centering, card styling, and form structure.
 */
export function AuthPageLayout({ children, title, description, footer, onSubmit }: AuthPageLayoutProps) {
	const content = (
		<Card>
			<CardHeader>
				<CardTitle className="text-2xl">{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">{children}</CardContent>
			{footer && <CardFooter className="flex flex-col space-y-4">{footer}</CardFooter>}
		</Card>
	)

	return (
		<div className="flex items-center justify-center min-h-[80vh] px-4 sm:px-0">
			{onSubmit ? (
				<form onSubmit={onSubmit} className="w-full max-w-md">
					{content}
				</form>
			) : (
				<div className="w-full max-w-md">{content}</div>
			)}
		</div>
	)
}
