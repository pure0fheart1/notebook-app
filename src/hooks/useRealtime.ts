import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'
import { useAuth } from './useAuth'

export function useRealtimeNotebooks() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!user) return

    // Subscribe to notebook changes
    const channel = supabase
      .channel('notebooks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notebooks',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['notebooks', user.id] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, queryClient])
}

export function useRealtimeNotes(notebookId?: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!notebookId) return

    // Subscribe to note changes
    const channel = supabase
      .channel(`notes-${notebookId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `notebook_id=eq.${notebookId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['notes', notebookId] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [notebookId, queryClient])
}

export function useRealtimeChecklistItems(noteId?: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!noteId) return

    // Subscribe to checklist item changes
    const channel = supabase
      .channel(`checklist-items-${noteId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'checklist_items',
          filter: `note_id=eq.${noteId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['checklist_items', noteId] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [noteId, queryClient])
}