import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import apiClient, { extractData } from '@/lib/api-client'
import { getErrorMessage } from '@/lib/error-utils'
import { emailQueryKeys } from '@/lib/queryKeys'
import type { ApiSuccessResponse } from '@/types'

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
	message: string
}

/**
 * Hook to fetch available email templates
 */
export function useEmailTemplates() {
	return useQuery({
		queryKey: emailQueryKeys.templates,
		queryFn: async (): Promise<EmailTemplatesResponse> => {
			const { data } = await apiClient.get<ApiSuccessResponse<EmailTemplatesResponse>>('/admin/email/templates')
			return extractData(data)
		},
		staleTime: 1000 * 60 * 5,
	})
}

/**
 * Hook to send a test email
 */
export function useSendTestEmail() {
	return useMutation({
		mutationFn: async (params: SendTestEmailParams): Promise<SendTestEmailResponse> => {
			const { data } = await apiClient.post<ApiSuccessResponse<SendTestEmailResponse>>(
				'/admin/email/test',
				params,
			)
			return extractData(data)
		},
		onSuccess: (data) => {
			toast.success('Success', { description: data.message })
		},
		onError: (error) => {
			toast.error('Error', { description: getErrorMessage(error) })
		},
	})
}
