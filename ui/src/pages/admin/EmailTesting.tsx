import { CheckCircle, Loader2, Mail, Send } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import PageHeader from '@/components/PageHeader'
import { QueryError, QueryLoading } from '@/components/QueryState'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { type EmailTemplate, useEmailTemplates, useSendTestEmail } from '@/hooks/useAdminEmail'

type TemplateType = 'verification' | 'passwordReset'

export default function EmailTesting() {
	const [sendingTemplate, setSendingTemplate] = useState<TemplateType | null>(null)
	const { data: templatesData, isLoading: templatesLoading, error } = useEmailTemplates()
	const sendTestEmail = useSendTestEmail()

	const handleSendTest = async (templateType: TemplateType) => {
		setSendingTemplate(templateType)
		try {
			await sendTestEmail.mutateAsync({ templateType })
			toast.success('Test email sent successfully! Check your inbox.')
		} catch (error) {
			toast.error('Failed to send test email')
		} finally {
			setSendingTemplate(null)
		}
	}

	if (templatesLoading) {
		return <QueryLoading text="Loading email templates..." />
	}

	if (error) {
		return <QueryError error={error} title="Unable to load templates" />
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<PageHeader
				title="Email Testing"
				subtitle="Test email templates by sending them to your admin email address"
			/>

			{/* Info Card */}
			<Card className="bg-linear-to-br from-primary/5 to-background border-primary/20">
				<CardHeader className="pb-3">
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
							<Mail className="h-5 w-5 text-primary" />
						</div>
						<div>
							<CardTitle className="text-lg">How it works</CardTitle>
							<CardDescription>
								Test emails will be sent to your admin email address. Use this to preview how emails
								appear to users.
							</CardDescription>
						</div>
					</div>
				</CardHeader>
			</Card>

			{/* Email Templates */}
			<div className="grid gap-4 md:grid-cols-2">
				{templatesData?.templates.map((template: EmailTemplate) => (
					<Card key={template.id}>
						<CardHeader>
							<div className="flex items-start justify-between">
								<div className="flex items-center gap-3">
									<div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
										<Mail className="h-5 w-5 text-muted-foreground" />
									</div>
									<div>
										<CardTitle className="text-lg">{template.name}</CardTitle>
										<CardDescription className="mt-1">{template.description}</CardDescription>
									</div>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<Button
								onClick={() => handleSendTest(template.id as TemplateType)}
								disabled={sendingTemplate !== null}
								className="w-full"
							>
								{sendingTemplate === template.id ? (
									<>
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										Sending...
									</>
								) : (
									<>
										<Send className="h-4 w-4 mr-2" />
										Send Test Email
									</>
								)}
							</Button>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Success Tips */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg flex items-center gap-2">
						<CheckCircle className="h-5 w-5 text-emerald-500" />
						Tips for Testing
					</CardTitle>
				</CardHeader>
				<CardContent>
					<ul className="space-y-2 text-sm text-muted-foreground">
						<li className="flex items-start gap-2">
							<span className="text-primary">•</span>
							<span>Test emails use placeholder URLs that won&apos;t actually work</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-primary">•</span>
							<span>Check your spam folder if emails don&apos;t appear in your inbox</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-primary">•</span>
							<span>Email delivery may take a few seconds depending on your email provider</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-primary">•</span>
							<span>
								If emails aren&apos;t being received, verify your Resend API key and sender domain
								configuration
							</span>
						</li>
					</ul>
				</CardContent>
			</Card>
		</div>
	)
}
