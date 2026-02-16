import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import apiClient, { extractData } from '@/lib/api-client'
import { getErrorMessage } from '@/lib/error-utils'
import { applicationQueryKeys } from '@/lib/queryKeys'
import type { Application, MutationError, NoteEntry } from '@/types'

export interface CreateNoteData {
	content: string
}

export const useAddNote = (applicationId: string) => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (data: CreateNoteData) => {
			const response = await apiClient.post(`/notes/application/${applicationId}`, data)
			return extractData(response.data) as NoteEntry
		},
		onMutate: async (newData) => {
			await queryClient.cancelQueries({ queryKey: applicationQueryKeys.detail(applicationId) })

			const previousApplication = queryClient.getQueryData<Application>(
				applicationQueryKeys.detail(applicationId),
			)

			const optimisticNote: NoteEntry = {
				id: `temp-${Date.now()}`,
				applicationId,
				content: newData.content,
				createdAt: new Date().toISOString(),
			}

			queryClient.setQueryData<Application>(applicationQueryKeys.detail(applicationId), (old) => {
				if (!old) return undefined
				return {
					...old,
					noteEntries: [optimisticNote, ...(old.noteEntries || [])],
				}
			})

			return { previousApplication }
		},
		onSuccess: () => {
			toast.success('Note added successfully')
		},
		onError: (error: MutationError, _newData, context) => {
			if (context?.previousApplication) {
				queryClient.setQueryData(applicationQueryKeys.detail(applicationId), context.previousApplication)
			}
			toast.error('Error', { description: getErrorMessage(error, 'Failed to add note') })
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: applicationQueryKeys.detail(applicationId) })
		},
	})
}

export const useDeleteNote = (applicationId: string) => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (noteId: string) => {
			await apiClient.delete(`/notes/${noteId}`)
		},
		onMutate: async (noteId) => {
			await queryClient.cancelQueries({ queryKey: applicationQueryKeys.detail(applicationId) })

			const previousApplication = queryClient.getQueryData<Application>(
				applicationQueryKeys.detail(applicationId),
			)

			queryClient.setQueryData<Application>(applicationQueryKeys.detail(applicationId), (old) => {
				if (!old) return undefined
				return {
					...old,
					noteEntries: (old.noteEntries || []).filter((note) => note.id !== noteId),
				}
			})

			return { previousApplication }
		},
		onSuccess: () => {
			toast.success('Note deleted successfully')
		},
		onError: (error: MutationError, _noteId, context) => {
			if (context?.previousApplication) {
				queryClient.setQueryData(applicationQueryKeys.detail(applicationId), context.previousApplication)
			}
			toast.error('Error', { description: getErrorMessage(error, 'Failed to delete note') })
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: applicationQueryKeys.detail(applicationId) })
		},
	})
}
