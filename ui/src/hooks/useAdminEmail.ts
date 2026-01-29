import { useMutation, useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'
import { getErrorMessage } from '@/lib/error-utils'

export interface EmailTemplate {
	id: string
	name: string
	description: string
}

export interface EmailTemplatesResponse {
	templates: EmailTemplate[]
}

export interface SendTestEmailParams {
	templateType: 'verification' | 'passwordReset'
}

export interface SendTestEmailResponse {
	success: boolean
	message: string
}

// Query keys for caching
export const adminEmailQueryKeys = {
	templates: ['admin', 'email', 'templates'] as const,
}

/**
 * Hook to fetch available email templates
 */
export function useEmailTemplates() {
	return useQuery({
		queryKey: adminEmailQueryKeys.templates,
		queryFn: async (): Promise<EmailTemplatesResponse> => {
			const { data } = await apiClient.get<EmailTemplatesResponse>('/admin/email/templates')
			return data
		},
	})
}

/**
 * Hook to send a test email
 */
export function useSendTestEmail() {
	return useMutation({
		mutationFn: async (params: SendTestEmailParams): Promise<SendTestEmailResponse> => {
			try {
				const { data } = await apiClient.post<SendTestEmailResponse>('/admin/email/test', params)
				return data
			} catch (error) {
				throw new Error(getErrorMessage(error))
			}
		},
	})
}
