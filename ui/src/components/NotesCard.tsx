import { MessageSquarePlus, StickyNote, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAddNote, useDeleteNote } from '@/hooks/useNotes'
import { formatDate } from '@/lib/utils'
import type { Application } from '@/types'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from './ui/alert-dialog'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger } from './ui/select'
import { Textarea } from './ui/textarea'

interface NotesCardProps {
	application: Application
}

type SortOrder = 'newest' | 'oldest'

const SORT_LABELS: Record<SortOrder, string> = {
	newest: 'Newest first',
	oldest: 'Oldest first',
}

/**
 * Notes card for the application detail page.
 * Displays all notes for an application with add/delete/sort functionality.
 */
export function NotesCard({ application }: NotesCardProps) {
	const addNoteMutation = useAddNote(application.id)
	const deleteNoteMutation = useDeleteNote(application.id)

	const [isAddingNote, setIsAddingNote] = useState(false)
	const [noteContent, setNoteContent] = useState('')
	const [noteToDelete, setNoteToDelete] = useState<string | null>(null)
	const [sortOrder, setSortOrder] = useState<SortOrder>('newest')

	const notes = useMemo(() => application.noteEntries || [], [application.noteEntries])

	const sortedNotes = useMemo(() => {
		return [...notes].sort((a, b) => {
			const dateA = new Date(a.createdAt).getTime()
			const dateB = new Date(b.createdAt).getTime()
			return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
		})
	}, [notes, sortOrder])

	const onAddNote = async () => {
		if (!noteContent.trim()) return

		try {
			await addNoteMutation.mutateAsync({ content: noteContent.trim() })
			setNoteContent('')
			setIsAddingNote(false)
		} catch {
			// Error handled by mutation hook
		}
	}

	const onDeleteNote = async () => {
		if (!noteToDelete) return

		try {
			await deleteNoteMutation.mutateAsync(noteToDelete)
		} catch {
			// Error handled by mutation hook
		} finally {
			setNoteToDelete(null)
		}
	}

	return (
		<>
			<Card className="shadow-lg">
				<CardHeader className="pb-3 flex flex-row items-center justify-between">
					<CardTitle className="text-lg font-semibold">Notes</CardTitle>
					<div className="flex items-center gap-2">
						{notes.length > 1 && (
							<Select value={sortOrder} onValueChange={(v) => setSortOrder(v as SortOrder)}>
								<SelectTrigger className="w-[140px] h-8 text-xs">
									<span data-slot="select-value" className="flex flex-1 text-left">
										{SORT_LABELS[sortOrder]}
									</span>
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="newest">Newest first</SelectItem>
									<SelectItem value="oldest">Oldest first</SelectItem>
								</SelectContent>
							</Select>
						)}
						{!isAddingNote && (
							<Button size="sm" variant="outline" onClick={() => setIsAddingNote(true)}>
								<MessageSquarePlus className="h-4 w-4 mr-2" />
								Add Note
							</Button>
						)}
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Add Note Form */}
					{isAddingNote && (
						<div className="p-4 border rounded-lg bg-muted/50 space-y-3">
							<Textarea
								placeholder="Write your note..."
								value={noteContent}
								onChange={(e) => setNoteContent(e.target.value)}
								rows={3}
								className="resize-none"
								autoFocus
							/>
							<div className="flex justify-end gap-2">
								<Button
									size="sm"
									variant="ghost"
									onClick={() => {
										setIsAddingNote(false)
										setNoteContent('')
									}}
								>
									Cancel
								</Button>
								<Button
									size="sm"
									onClick={onAddNote}
									disabled={!noteContent.trim() || addNoteMutation.isPending}
								>
									{addNoteMutation.isPending ? 'Saving...' : 'Save Note'}
								</Button>
							</div>
						</div>
					)}

					{/* Notes List */}
					{sortedNotes.length > 0 ? (
						<div className="space-y-3">
							{sortedNotes.map((note) => (
								<div
									key={note.id}
									className="group relative p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
								>
									<span className="text-xs text-muted-foreground">
										{formatDate(note.createdAt, 'long')}
									</span>
									<div className="whitespace-pre-wrap text-sm leading-relaxed pr-8 mt-1">
										{note.content}
									</div>
									<Button
										variant="ghost"
										size="icon"
										className="absolute top-2 right-2 h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
										onClick={() => setNoteToDelete(note.id)}
										aria-label={`Delete note`}
									>
										<Trash2 className="h-3.5 w-3.5" />
									</Button>
								</div>
							))}
						</div>
					) : !isAddingNote ? (
						<div className="flex flex-col items-center text-center py-6 px-4">
							<div className="rounded-full bg-primary/10 p-3 mb-4">
								<StickyNote className="h-6 w-6 text-primary" />
							</div>
							<p className="text-sm font-medium mb-1">No notes yet</p>
							<p className="text-xs text-muted-foreground max-w-[240px]">
								Add notes to keep track of important details about this application.
							</p>
						</div>
					) : null}
				</CardContent>
			</Card>

			{/* Delete Note Confirmation Dialog */}
			<AlertDialog open={!!noteToDelete} onOpenChange={(open) => !open && setNoteToDelete(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Note?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete this note. This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={onDeleteNote}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							disabled={deleteNoteMutation.isPending}
						>
							{deleteNoteMutation.isPending ? 'Deleting...' : 'Delete'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
