import { Resend } from 'resend'
import { emailTemplates } from '@/emails/templates'

const resend = new Resend(process.env.RESEND_API_KEY!)

export const notificationService = {
	// Email verification
	sendVerificationEmail: async (to: string, userName: string, url: string) => {
		await resend.emails.send({
			from: process.env.EMAIL_FROM!,
			to,
			subject: 'Verify Your Email - Job Tracker',
			html: emailTemplates.verification(url, userName),
		})
	},

	// Password reset
	sendPasswordReset: async (to: string, userName: string, url: string) => {
		await resend.emails.send({
			from: process.env.EMAIL_FROM!,
			to,
			subject: 'Reset Your Password - Job Tracker',
			html: emailTemplates.passwordReset(url, userName),
		})
	},
}
