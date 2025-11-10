import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'
import toast from 'react-hot-toast'
import { logError, getUserFriendlyMessage } from '@/services/errorTracking'

export interface ChecklistItem {
  id: string
  note_id: string
  text: string
  checked: boolean
  order_index: number
  created_at: string
  updated_at: string
}

const MAX_ITEM_LENGTH = 500

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

      if (error) {
        logError(error, { component: 'useChecklistItems', action: 'fetch', noteId })
        throw error
      }

      return data as ChecklistItem[]
    },
    enabled: !!noteId,
    retry: 3,
    staleTime: 60000, // 1 minute
  })

  const createMutation = useMutation({
    mutationFn: async ({ noteId, text }: { noteId: string; text: string }) => {
      const trimmedText = text.trim()

      // Validation
      if (!trimmedText) {
        throw new Error('Please enter item text')
      }

      if (trimmedText.length > MAX_ITEM_LENGTH) {
        throw new Error(`Item text must be ${MAX_ITEM_LENGTH} characters or less`)
      }

      // Get count to avoid race condition
      const { count } = await supabase
        .from('checklist_items')
        .select('*', { count: 'exact', head: true })
        .eq('note_id', noteId)

      const { data, error } = await supabase
        .from('checklist_items')
        .insert({
          note_id: noteId,
          text: trimmedText,
          order_index: count || 0,
          checked: false,
        })
        .select()
        .single()

      if (error) {
        logError(error, { component: 'useChecklistItems', action: 'create', noteId })
        throw error
      }

      return data as ChecklistItem
    },
    onMutate: async ({ noteId, text }) => {
      await queryClient.cancelQueries({ queryKey: ['checklist_items', noteId] })
      const previousItems = queryClient.getQueryData<ChecklistItem[]>([
        'checklist_items',
        noteId,
      ])

      // Optimistically add item
      const optimisticItem: ChecklistItem = {
        id: `temp-${Date.now()}`,
        note_id: noteId,
        text: text.trim(),
        checked: false,
        order_index: previousItems?.length || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      queryClient.setQueryData<ChecklistItem[]>(
        ['checklist_items', noteId],
        (old = []) => [...old, optimisticItem]
      )

      return { previousItems }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist_items', noteId] })
      toast.success('Item added!', { icon: '✅' })
    },
    onError: (error, { noteId: _noteId }, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(['checklist_items', noteId], context.previousItems)
      }
      toast.error(getUserFriendlyMessage(error))
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<ChecklistItem> & { id: string }) => {
      // Text validation if updating text
      if (updates.text !== undefined) {
        const trimmedText = updates.text.trim()
        if (!trimmedText) {
          throw new Error('Please enter item text')
        }
        if (trimmedText.length > MAX_ITEM_LENGTH) {
          throw new Error(`Item text must be ${MAX_ITEM_LENGTH} characters or less`)
        }
        updates.text = trimmedText
      }

      const { data, error } = await supabase
        .from('checklist_items')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        logError(error, { component: 'useChecklistItems', action: 'update', itemId: id })
        throw error
      }

      return data as ChecklistItem
    },
    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: ['checklist_items', noteId] })
      const previousItems = queryClient.getQueryData<ChecklistItem[]>([
        'checklist_items',
        noteId,
      ])

      // Optimistically update
      queryClient.setQueryData<ChecklistItem[]>(
        ['checklist_items', noteId],
        (old = []) =>
          old.map((item) =>
            item.id === id
              ? { ...item, ...updates, updated_at: new Date().toISOString() }
              : item
          )
      )

      return { previousItems }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist_items', noteId] })
    },
    onError: (error, { id: _id }, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(['checklist_items', noteId], context.previousItems)
      }
      toast.error(getUserFriendlyMessage(error))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('checklist_items').delete().eq('id', id)

      if (error) {
        logError(error, { component: 'useChecklistItems', action: 'delete', itemId: id })
        throw error
      }
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['checklist_items', noteId] })
      const previousItems = queryClient.getQueryData<ChecklistItem[]>([
        'checklist_items',
        noteId,
      ])

      // Optimistically remove
      queryClient.setQueryData<ChecklistItem[]>(['checklist_items', noteId], (old = []) =>
        old.filter((item) => item.id !== id)
      )

      return { previousItems }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist_items', noteId] })
      toast.success('Item deleted!', { icon: '🗑️' })
    },
    onError: (error, _id, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(['checklist_items', noteId], context.previousItems)
      }
      toast.error(getUserFriendlyMessage(error))
    },
  })

  const toggleMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const item = query.data?.find((i) => i.id === itemId)
      if (!item) throw new Error('Item not found')

      const { data, error } = await supabase
        .from('checklist_items')
        .update({ checked: !item.checked })
        .eq('id', itemId)
        .select()
        .single()

      if (error) {
        logError(error, { component: 'useChecklistItems', action: 'toggle', itemId })
        throw error
      }

      return data as ChecklistItem
    },
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: ['checklist_items', noteId] })
      const previousItems = queryClient.getQueryData<ChecklistItem[]>([
        'checklist_items',
        noteId,
      ])

      // Optimistically toggle
      queryClient.setQueryData<ChecklistItem[]>(['checklist_items', noteId], (old = []) =>
        old.map((item) =>
          item.id === itemId ? { ...item, checked: !item.checked } : item
        )
      )

      return { previousItems }
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['checklist_items', noteId] })
      // Subtle feedback, no toast to avoid spam
    },
    onError: (error, _itemId, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(['checklist_items', noteId], context.previousItems)
      }
      toast.error(getUserFriendlyMessage(error))
    },
  })

  const reorderMutation = useMutation({
    mutationFn: async (items: ChecklistItem[]) => {
      const updates = items.map((item, index) => ({
        id: item.id,
        order_index: index,
      }))

      const promises = updates.map(({ id, order_index }) =>
        supabase.from('checklist_items').update({ order_index }).eq('id', id)
      )

      const results = await Promise.all(promises)
      const error = results.find((r) => r.error)?.error

      if (error) {
        logError(error, { component: 'useChecklistItems', action: 'reorder', noteId })
        throw error
      }
    },
    onMutate: async (items) => {
      await queryClient.cancelQueries({ queryKey: ['checklist_items', noteId] })
      const previousItems = queryClient.getQueryData<ChecklistItem[]>([
        'checklist_items',
        noteId,
      ])

      // Optimistically reorder
      queryClient.setQueryData<ChecklistItem[]>(['checklist_items', noteId], items)

      return { previousItems }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist_items', noteId] })
      toast.success('Items reordered!', { icon: '↕️' })
    },
    onError: (error, _items, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(['checklist_items', noteId], context.previousItems)
      }
      toast.error(getUserFriendlyMessage(error))
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
