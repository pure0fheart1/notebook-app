import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'
import toast from 'react-hot-toast'
import { logError, getUserFriendlyMessage } from '@/services/errorTracking'

export interface Note {
  id: string
  notebook_id: string
  title: string
  content: any
  is_checklist: boolean
  order_index: number
  is_pinned: boolean
  is_archived: boolean
  created_at: string
  updated_at: string
}

const MAX_TITLE_LENGTH = 200

export function useNotes(notebookId?: string) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['notes', notebookId],
    queryFn: async () => {
      if (!notebookId) return []

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('notebook_id', notebookId)
        .eq('is_archived', false)
        .order('is_pinned', { ascending: false })
        .order('updated_at', { ascending: false })

      if (error) {
        logError(error, { component: 'useNotes', action: 'fetchNotes', notebookId })
        throw error
      }

      return data as Note[]
    },
    enabled: !!notebookId,
    retry: 3,
    staleTime: 60000, // 1 minute
  })

  const createMutation = useMutation({
    mutationFn: async ({
      notebookId,
      title,
      isChecklist = false,
    }: {
      notebookId: string
      title: string
      isChecklist?: boolean
    }) => {
      const trimmedTitle = title.trim()

      // Validation
      if (!trimmedTitle) {
        throw new Error('Please enter a note title')
      }

      if (trimmedTitle.length > MAX_TITLE_LENGTH) {
        throw new Error(`Title must be ${MAX_TITLE_LENGTH} characters or less`)
      }

      // Get count to avoid race condition
      const { count } = await supabase
        .from('notes')
        .select('*', { count: 'exact', head: true })
        .eq('notebook_id', notebookId)
        .eq('is_archived', false)

      const { data, error } = await supabase
        .from('notes')
        .insert({
          notebook_id: notebookId,
          title: trimmedTitle,
          is_checklist: isChecklist,
          content: isChecklist ? '[]' : '',
          order_index: count || 0,
          is_pinned: false,
          is_archived: false,
        })
        .select()
        .single()

      if (error) {
        logError(error, { component: 'useNotes', action: 'createNote', notebookId })
        throw error
      }

      return data as Note
    },
    onMutate: async ({ notebookId, title, isChecklist }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['notes', notebookId] })

      // Snapshot previous value
      const previousNotes = queryClient.getQueryData<Note[]>(['notes', notebookId])

      // Optimistically update
      const optimisticNote: Note = {
        id: `temp-${Date.now()}`,
        notebook_id: notebookId,
        title: title.trim(),
        content: isChecklist ? '[]' : '',
        is_checklist: isChecklist || false,
        order_index: previousNotes?.length || 0,
        is_pinned: false,
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      queryClient.setQueryData<Note[]>(['notes', notebookId], (old = []) => [
        optimisticNote,
        ...old,
      ])

      return { previousNotes }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', notebookId] })
      toast.success('Note created!', { icon: '✨' })
    },
    onError: (error, { notebookId }, context) => {
      // Rollback on error
      if (context?.previousNotes) {
        queryClient.setQueryData(['notes', notebookId], context.previousNotes)
      }
      toast.error(getUserFriendlyMessage(error))
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Note> & { id: string }) => {
      // Title validation if updating title
      if (updates.title !== undefined) {
        const trimmedTitle = updates.title.trim()
        if (!trimmedTitle) {
          throw new Error('Please enter a note title')
        }
        if (trimmedTitle.length > MAX_TITLE_LENGTH) {
          throw new Error(`Title must be ${MAX_TITLE_LENGTH} characters or less`)
        }
        updates.title = trimmedTitle
      }

      const { data, error } = await supabase
        .from('notes')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        logError(error, { component: 'useNotes', action: 'updateNote', noteId: id })
        throw error
      }

      return data as Note
    },
    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: ['notes', notebookId] })
      const previousNotes = queryClient.getQueryData<Note[]>(['notes', notebookId])

      // Optimistically update
      queryClient.setQueryData<Note[]>(['notes', notebookId], (old = []) =>
        old.map((note) =>
          note.id === id
            ? { ...note, ...updates, updated_at: new Date().toISOString() }
            : note
        )
      )

      return { previousNotes }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', notebookId] })
    },
    onError: (error, { id: _id }, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(['notes', notebookId], context.previousNotes)
      }
      toast.error(getUserFriendlyMessage(error))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notes').delete().eq('id', id)

      if (error) {
        logError(error, { component: 'useNotes', action: 'deleteNote', noteId: id })
        throw error
      }
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notes', notebookId] })
      const previousNotes = queryClient.getQueryData<Note[]>(['notes', notebookId])

      // Optimistically remove
      queryClient.setQueryData<Note[]>(['notes', notebookId], (old = []) =>
        old.filter((note) => note.id !== id)
      )

      return { previousNotes }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', notebookId] })
      toast.success('Note deleted!', { icon: '🗑️' })
    },
    onError: (error, _id, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(['notes', notebookId], context.previousNotes)
      }
      toast.error(getUserFriendlyMessage(error))
    },
  })

  const pinMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const note = query.data?.find((n) => n.id === noteId)
      if (!note) throw new Error('Note not found')

      const { data, error } = await supabase
        .from('notes')
        .update({ is_pinned: !note.is_pinned })
        .eq('id', noteId)
        .select()
        .single()

      if (error) {
        logError(error, { component: 'useNotes', action: 'pinNote', noteId })
        throw error
      }

      return data as Note
    },
    onMutate: async (noteId) => {
      await queryClient.cancelQueries({ queryKey: ['notes', notebookId] })
      const previousNotes = queryClient.getQueryData<Note[]>(['notes', notebookId])

      // Optimistically toggle pin
      queryClient.setQueryData<Note[]>(['notes', notebookId], (old = []) =>
        old.map((note) =>
          note.id === noteId ? { ...note, is_pinned: !note.is_pinned } : note
        )
      )

      return { previousNotes }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notes', notebookId] })
      toast.success(data.is_pinned ? 'Note pinned!' : 'Note unpinned!', {
        icon: data.is_pinned ? '📌' : '📍',
      })
    },
    onError: (error, _noteId, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(['notes', notebookId], context.previousNotes)
      }
      toast.error(getUserFriendlyMessage(error))
    },
  })

  return {
    notes: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createNote: createMutation.mutate,
    updateNote: updateMutation.mutate,
    deleteNote: deleteMutation.mutate,
    pinNote: pinMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isPinning: pinMutation.isPending,
  }
}
