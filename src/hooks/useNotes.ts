import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'
import toast from 'react-hot-toast'

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
        .order('is_pinned', { ascending: false })
        .order('updated_at', { ascending: false })

      if (error) throw error
      return data as Note[]
    },
    enabled: !!notebookId,
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
      const { data, error } = await supabase
        .from('notes')
        .insert({
          notebook_id: notebookId,
          title,
          is_checklist: isChecklist,
          content: isChecklist ? [] : '',
          order_index: query.data?.length || 0,
        })
        .select()
        .single()

      if (error) throw error
      return data as Note
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', notebookId] })
      toast.success('Note created!')
    },
    onError: () => {
      toast.error('Failed to create note')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Note> & { id: string }) => {
      const { data, error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Note
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', notebookId] })
    },
    onError: () => {
      toast.error('Failed to update note')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', notebookId] })
      toast.success('Note deleted!')
    },
    onError: () => {
      toast.error('Failed to delete note')
    },
  })

  const pinMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const note = query.data?.find((n) => n.id === noteId)
      if (!note) return

      const { data, error } = await supabase
        .from('notes')
        .update({ is_pinned: !note.is_pinned })
        .eq('id', noteId)
        .select()
        .single()

      if (error) throw error
      return data as Note
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', notebookId] })
    },
    onError: () => {
      toast.error('Failed to pin note')
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