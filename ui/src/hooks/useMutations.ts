import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import apiClient, { extractData } from '@/lib/api-client'
import { getErrorMessage } from '@/lib/error-utils'
import { applicationQueryKeys } from '@/lib/queryKeys'
import type { Application, ApplicationStatus, ApplicationSummary, MutationError, WorkType } from '@/types'

export interface CreateApplicationData {
	company: string
	jobTitle: string
	jobDescriptionUrl?: string
	salary?: string
	location?: string
	workType?: WorkType
	contactInfo?: string
	status: ApplicationStatus
	appliedAt?: string
}

export const useCreateApplication = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (data: CreateApplicationData) => {
			const response = await apiClient.post('/applications', data)
			return extractData(response.data)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: applicationQueryKeys.all })
			queryClient.invalidateQueries({ queryKey: applicationQueryKeys.active })
			toast.success('Application created successfully')
		},
		onError: (error: MutationError) => {
			toast.error('Error', { description: getErrorMessage(error, 'Failed to create application') })
		},
	})
}

export const useUpdateApplication = (id: string) => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (data: Partial<CreateApplicationData>) => {
			const response = await apiClient.put(`/applications/${id}`, data)
			return extractData(response.data)
		},
		onMutate: async (newData) => {
			await queryClient.cancelQueries({ queryKey: applicationQueryKeys.detail(id) })
			const previousApplication = queryClient.getQueryData<Application>(applicationQueryKeys.detail(id))
			queryClient.setQueryData<Application>(applicationQueryKeys.detail(id), (old) => {
				if (!old) return undefined
				const updates: Partial<Application> = { ...newData } as Partial<Application>
				return { ...old, ...updates }
			})
			return { previousApplication }
		},
		onSuccess: () => {
			toast.success('Application updated successfully')
		},
		onError: (error: MutationError, _newData, context) => {
			if (context?.previousApplication) {
				queryClient.setQueryData(applicationQueryKeys.detail(id), context.previousApplication)
			}
			toast.error('Error', { description: getErrorMessage(error, 'Failed to update application') })
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: applicationQueryKeys.all })
			queryClient.invalidateQueries({ queryKey: applicationQueryKeys.active })
			queryClient.invalidateQueries({ queryKey: applicationQueryKeys.detail(id) })
		},
	})
}

/**
 * Update an application's status. Used by kanban boards and tablet/mobile status dropdowns.
 * Calls PUT /api/applications/:id with { status }.
 */
export const useUpdateStatusDynamic = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (data: { applicationId: string; status: ApplicationStatus }) => {
			const response = await apiClient.put(`/applications/${data.applicationId}`, {
				status: data.status,
			})
			return extractData(response.data)
		},
		onMutate: async (newData) => {
			const { applicationId, status } = newData
			await queryClient.cancelQueries({ queryKey: applicationQueryKeys.detail(applicationId) })
			await queryClient.cancelQueries({ queryKey: applicationQueryKeys.all })
			await queryClient.cancelQueries({ queryKey: applicationQueryKeys.active })
			const previousApplication = queryClient.getQueryData<Application>(
				applicationQueryKeys.detail(applicationId),
			)
			const previousApplications = queryClient.getQueryData<ApplicationSummary[]>(applicationQueryKeys.all)
			const previousActiveApplications = queryClient.getQueryData<ApplicationSummary[]>(
				applicationQueryKeys.active,
			)

			// Optimistic update for detail view
			queryClient.setQueryData<Application>(applicationQueryKeys.detail(applicationId), (old) => {
				if (!old) return undefined
				return { ...old, status, statusUpdatedAt: new Date().toISOString() }
			})

			// Optimistic update for all applications list
			if (previousApplications) {
				queryClient.setQueryData<ApplicationSummary[]>(applicationQueryKeys.all, (old) => {
					if (!old) return old
					return old.map((app) => {
						if (app.id !== applicationId) return app
						return {
							...app,
							status,
							statusUpdatedAt: new Date().toISOString(),
						}
					})
				})
			}

			// Optimistic update for active applications list
			if (previousActiveApplications) {
				queryClient.setQueryData<ApplicationSummary[]>(applicationQueryKeys.active, (old) => {
					if (!old) return old
					return old.map((app) => {
						if (app.id !== applicationId) return app
						return {
							...app,
							status,
							statusUpdatedAt: new Date().toISOString(),
						}
					})
				})
			}

			return { previousApplication, previousApplications, previousActiveApplications, applicationId }
		},
		onSuccess: () => {
			toast.success('Status updated successfully')
		},
		onError: (error: MutationError, _newData, context) => {
			if (context?.previousApplication && context?.applicationId) {
				queryClient.setQueryData(
					applicationQueryKeys.detail(context.applicationId),
					context.previousApplication,
				)
			}
			if (context?.previousApplications) {
				queryClient.setQueryData(applicationQueryKeys.all, context.previousApplications)
			}
			if (context?.previousActiveApplications) {
				queryClient.setQueryData(applicationQueryKeys.active, context.previousActiveApplications)
			}
			toast.error('Error', { description: getErrorMessage(error, 'Failed to update status') })
		},
		onSettled: (_data, _error, variables) => {
			queryClient.invalidateQueries({ queryKey: applicationQueryKeys.detail(variables.applicationId) })
			queryClient.invalidateQueries({ queryKey: applicationQueryKeys.all })
			queryClient.invalidateQueries({ queryKey: applicationQueryKeys.active })
		},
	})
}

export const useArchiveApplication = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (id: string) => {
			const response = await apiClient.post(`/applications/${id}/archive`)
			return extractData(response.data)
		},
		onSuccess: () => {
			queryClient.refetchQueries({ queryKey: applicationQueryKeys.all })
			queryClient.refetchQueries({ queryKey: applicationQueryKeys.active })
			queryClient.refetchQueries({ queryKey: applicationQueryKeys.archived })
			toast.success('Application archived successfully')
		},
		onError: (error: MutationError) => {
			toast.error('Error', { description: getErrorMessage(error, 'Failed to archive application') })
		},
	})
}

export const useRestoreApplication = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (id: string) => {
			const response = await apiClient.post(`/applications/${id}/restore`)
			return extractData(response.data)
		},
		onSuccess: () => {
			queryClient.refetchQueries({ queryKey: applicationQueryKeys.all })
			queryClient.refetchQueries({ queryKey: applicationQueryKeys.active })
			queryClient.refetchQueries({ queryKey: applicationQueryKeys.archived })
			toast.success('Application restored successfully')
		},
		onError: (error: MutationError) => {
			toast.error('Error', { description: getErrorMessage(error, 'Failed to restore application') })
		},
	})
}
