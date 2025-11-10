import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'
import toast from 'react-hot-toast'

export interface ChecklistItem {
  id: string
  note_id: string
  text: string
  checked: boolean
  order_index: number
  created_at: string
  updated_at: string
}

export function useChecklistItems(noteId?: string) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['checklist_items', noteId],
    queryFn: async () => {
      if (!noteId) return []

      const { data, error } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('note_id', noteId)
        .order('order_index', { ascending: true })

      if (error) throw error
      return data as ChecklistItem[]
    },
    enabled: !!noteId,
  })

  const createMutation = useMutation({
    mutationFn: async ({ noteId, text }: { noteId: string; text: string }) => {
      const { data, error } = await supabase
        .from('checklist_items')
        .insert({
          note_id: noteId,
          text,
          order_index: query.data?.length || 0,
        })
        .select()
        .single()

      if (error) throw error
      return data as ChecklistItem
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist_items', noteId] })
    },
    onError: () => {
      toast.error('Failed to add checklist item')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<ChecklistItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('checklist_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as ChecklistItem
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist_items', noteId] })
    },
    onError: () => {
      toast.error('Failed to update item')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('checklist_items')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist_items', noteId] })
      toast.success('Item deleted')
    },
    onError: () => {
      toast.error('Failed to delete item')
    },
  })

  const toggleMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const item = query.data?.find((i) => i.id === itemId)
      if (!item) return

      const { data, error } = await supabase
        .from('checklist_items')
        .update({ checked: !item.checked })
        .eq('id', itemId)
        .select()
        .single()

      if (error) throw error
      return data as ChecklistItem
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist_items', noteId] })
    },
    onError: () => {
      toast.error('Failed to toggle item')
    },
  })

  const reorderMutation = useMutation({
    mutationFn: async (items: ChecklistItem[]) => {
      const updates = items.map((item, index) => ({
        id: item.id,
        order_index: index,
      }))

      const promises = updates.map(({ id, order_index }) =>
        supabase
          .from('checklist_items')
          .update({ order_index })
          .eq('id', id)
      )

      const results = await Promise.all(promises)
      const error = results.find((r) => r.error)?.error

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist_items', noteId] })
    },
    onError: () => {
      toast.error('Failed to reorder items')
    },
  })

  return {
    items: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    addItem: createMutation.mutate,
    updateItem: updateMutation.mutate,
    deleteItem: deleteMutation.mutate,
    toggleItem: toggleMutation.mutate,
    reorderItems: reorderMutation.mutate,
    isAdding: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isToggling: toggleMutation.isPending,
    isReordering: reorderMutation.isPending,
  }
}