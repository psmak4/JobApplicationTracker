import { escapeHtml } from '@/utils/htmlEscape'

export const emailTemplates = {
	verification: (url: string, userName: string) => {
		// Escape user-provided content to prevent XSS
		const safeUserName = escapeHtml(userName)

		return `
		<!DOCTYPE html>
		<html>
		<head>
			<style>
				body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
				.container { max-width: 600px; margin: 0 auto; padding: 20px; }
				.button { 
					display: inline-block; 
					padding: 12px 24px; 
					background-color: #2563eb; 
					color: white; 
					text-decoration: none; 
					border-radius: 6px; 
					margin: 20px 0;
				}
				.footer { margin-top: 30px; font-size: 12px; color: #666; }
			</style>
		</head>
		<body>
			<div class="container">
				<h2>Welcome to Job Application Tracker, ${safeUserName}!</h2>
				<p>Thanks for signing up. Please verify your email address to get started:</p>
				<a href="${url}" class="button">Verify Email Address</a>
				<p>This link will expire in 24 hours.</p>
				<p>If you didn't create an account, you can safely ignore this email.</p>
				<div class="footer">
					<p>Job Application Tracker | Built for developers, by developers</p>
				</div>
			</div>
		</body>
		</html>
		`
	},

	passwordReset: (url: string, userName: string) => {
		// Escape user-provided content to prevent XSS
		const safeUserName = escapeHtml(userName)

		return `
		<!DOCTYPE html>
		<html>
		<head>
			<style>
				body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
				.container { max-width: 600px; margin: 0 auto; padding: 20px; }
				.button { 
					display: inline-block; 
					padding: 12px 24px; 
					background-color: #2563eb; 
					color: white; 
					text-decoration: none; 
					border-radius: 6px; 
					margin: 20px 0;
				}
				.footer { margin-top: 30px; font-size: 12px; color: #666; }
			</style>
		</head>
		<body>
			<div class="container">
				<h2>Password Reset Request</h2>
				<p>Hi ${safeUserName},</p>
				<p>We received a request to reset your password. Click the button below to create a new password:</p>
				<a href="${url}" class="button">Reset Password</a>
				<p>This link will expire in 1 hour.</p>
				<p>If you didn't request this, you can safely ignore this email - your password won't be changed.</p>
				<div class="footer">
					<p>Job Application Tracker</p>
				</div>
			</div>
		</body>
		</html>
		`
	},
}
