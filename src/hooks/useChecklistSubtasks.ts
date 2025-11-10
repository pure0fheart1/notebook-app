import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'
import toast from 'react-hot-toast'
import { logError, getUserFriendlyMessage } from '@/services/errorTracking'

export interface ChecklistSubtask {
  id: string
  item_id: string
  text: string
  checked: boolean
  order_index: number
  created_at: string
  updated_at: string
}

const MAX_SUBTASK_LENGTH = 500

export function useChecklistSubtasks(itemId?: string) {
  const queryClient = useQueryClient()

  // Fetch all subtasks for a given item
  const query = useQuery({
    queryKey: ['checklist_subtasks', itemId],
    queryFn: async () => {
      if (!itemId) return []

      const { data, error } = await supabase
        .from('checklist_subtasks' as any)
        .select('*')
        .eq('item_id', itemId)
        .order('order_index', { ascending: true })

      if (error) {
        logError(error, { component: 'useChecklistSubtasks', action: 'fetch', itemId })
        throw error
      }

      return data as unknown as ChecklistSubtask[]
    },
    enabled: !!itemId,
    retry: 3,
    staleTime: 60000, // 1 minute
  })

  // Create a new subtask
  const createMutation = useMutation({
    mutationFn: async ({ itemId, text }: { itemId: string; text: string }) => {
      const trimmedText = text.trim()

      // Validation
      if (!trimmedText) {
        throw new Error('Please enter subtask text')
      }

      if (trimmedText.length > MAX_SUBTASK_LENGTH) {
        throw new Error(`Subtask text must be ${MAX_SUBTASK_LENGTH} characters or less`)
      }

      // Get count to determine order_index
      const { count } = await supabase
        .from('checklist_subtasks' as any)
        .select('*', { count: 'exact', head: true })
        .eq('item_id', itemId)

      const { data, error } = await supabase
        .from('checklist_subtasks' as any)
        .insert({
          item_id: itemId,
          text: trimmedText,
          order_index: count || 0,
          checked: false,
        })
        .select()
        .single()

      if (error) {
        logError(error, { component: 'useChecklistSubtasks', action: 'create', itemId })
        throw error
      }

      return data as unknown as ChecklistSubtask
    },
    onMutate: async ({ itemId, text }) => {
      await queryClient.cancelQueries({ queryKey: ['checklist_subtasks', itemId] })
      const previousSubtasks = queryClient.getQueryData<ChecklistSubtask[]>([
        'checklist_subtasks',
        itemId,
      ])

      // Optimistically add subtask
      const optimisticSubtask: ChecklistSubtask = {
        id: `temp-${Date.now()}`,
        item_id: itemId,
        text: text.trim(),
        checked: false,
        order_index: previousSubtasks?.length || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      queryClient.setQueryData<ChecklistSubtask[]>(
        ['checklist_subtasks', itemId],
        (old = []) => [...old, optimisticSubtask]
      )

      return { previousSubtasks }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['checklist_subtasks', variables.itemId] })
      // Also invalidate parent items to update UI
      queryClient.invalidateQueries({ queryKey: ['checklist_items'] })
      toast.success('Sub-task added!', { icon: '✅' })
    },
    onError: (error, variables, context) => {
      if (context?.previousSubtasks) {
        queryClient.setQueryData(['checklist_subtasks', variables.itemId], context.previousSubtasks)
      }
      toast.error(getUserFriendlyMessage(error))
    },
  })

  // Update a subtask
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      itemId,
      ...updates
    }: Partial<ChecklistSubtask> & { id: string; itemId: string }) => {
      // Text validation if updating text
      if (updates.text !== undefined) {
        const trimmedText = updates.text.trim()
        if (!trimmedText) {
          throw new Error('Please enter subtask text')
        }
        if (trimmedText.length > MAX_SUBTASK_LENGTH) {
          throw new Error(`Subtask text must be ${MAX_SUBTASK_LENGTH} characters or less`)
        }
        updates.text = trimmedText
      }

      const { data, error } = await supabase
        .from('checklist_subtasks' as any)
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        logError(error, { component: 'useChecklistSubtasks', action: 'update', subtaskId: id })
        throw error
      }

      return data as unknown as ChecklistSubtask
    },
    onMutate: async ({ id, itemId, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: ['checklist_subtasks', itemId] })
      const previousSubtasks = queryClient.getQueryData<ChecklistSubtask[]>([
        'checklist_subtasks',
        itemId,
      ])

      // Optimistically update
      queryClient.setQueryData<ChecklistSubtask[]>(
        ['checklist_subtasks', itemId],
        (old = []) =>
          old.map((subtask) =>
            subtask.id === id
              ? { ...subtask, ...updates, updated_at: new Date().toISOString() }
              : subtask
          )
      )

      return { previousSubtasks }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['checklist_subtasks', variables.itemId] })
      queryClient.invalidateQueries({ queryKey: ['checklist_items'] })
    },
    onError: (error, variables, context) => {
      if (context?.previousSubtasks) {
        queryClient.setQueryData(['checklist_subtasks', variables.itemId], context.previousSubtasks)
      }
      toast.error(getUserFriendlyMessage(error))
    },
  })

  // Delete a subtask
  const deleteMutation = useMutation({
    mutationFn: async ({ id, itemId: _itemId }: { id: string; itemId: string }) => {
      const { error } = await supabase.from('checklist_subtasks' as any).delete().eq('id', id)

      if (error) {
        logError(error, { component: 'useChecklistSubtasks', action: 'delete', subtaskId: id })
        throw error
      }
    },
    onMutate: async ({ id, itemId }) => {
      await queryClient.cancelQueries({ queryKey: ['checklist_subtasks', itemId] })
      const previousSubtasks = queryClient.getQueryData<ChecklistSubtask[]>([
        'checklist_subtasks',
        itemId,
      ])

      // Optimistically remove
      queryClient.setQueryData<ChecklistSubtask[]>(['checklist_subtasks', itemId], (old = []) =>
        old.filter((subtask) => subtask.id !== id)
      )

      return { previousSubtasks }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['checklist_subtasks', variables.itemId] })
      queryClient.invalidateQueries({ queryKey: ['checklist_items'] })
      toast.success('Sub-task deleted!', { icon: '🗑️' })
    },
    onError: (error, variables, context) => {
      if (context?.previousSubtasks) {
        queryClient.setQueryData(['checklist_subtasks', variables.itemId], context.previousSubtasks)
      }
      toast.error(getUserFriendlyMessage(error))
    },
  })

  // Toggle subtask checked status
  const toggleMutation = useMutation({
    mutationFn: async ({ id, itemId: _itemId }: { id: string; itemId: string }) => {
      const subtask = query.data?.find((s) => s.id === id)
      if (!subtask) throw new Error('Subtask not found')

      const { data, error } = await supabase
        .from('checklist_subtasks' as any)
        .update({ checked: !subtask.checked })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        logError(error, { component: 'useChecklistSubtasks', action: 'toggle', subtaskId: id })
        throw error
      }

      return data as unknown as ChecklistSubtask
    },
    onMutate: async ({ id, itemId }) => {
      await queryClient.cancelQueries({ queryKey: ['checklist_subtasks', itemId] })
      const previousSubtasks = queryClient.getQueryData<ChecklistSubtask[]>([
        'checklist_subtasks',
        itemId,
      ])

      // Optimistically toggle
      queryClient.setQueryData<ChecklistSubtask[]>(['checklist_subtasks', itemId], (old = []) =>
        old.map((subtask) =>
          subtask.id === id ? { ...subtask, checked: !subtask.checked } : subtask
        )
      )

      return { previousSubtasks }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['checklist_subtasks', variables.itemId] })
      queryClient.invalidateQueries({ queryKey: ['checklist_items'] })
      // Subtle feedback, no toast to avoid spam
    },
    onError: (error, variables, context) => {
      if (context?.previousSubtasks) {
        queryClient.setQueryData(['checklist_subtasks', variables.itemId], context.previousSubtasks)
      }
      toast.error(getUserFriendlyMessage(error))
    },
  })

  // Reorder subtasks
  const reorderMutation = useMutation({
    mutationFn: async ({ itemId, subtasks }: { itemId: string; subtasks: ChecklistSubtask[] }) => {
      const updates = subtasks.map((subtask, index) => ({
        id: subtask.id,
        order_index: index,
      }))

      const promises = updates.map(({ id, order_index }) =>
        supabase.from('checklist_subtasks' as any).update({ order_index }).eq('id', id)
      )

      const results = await Promise.all(promises)
      const error = results.find((r) => r.error)?.error

      if (error) {
        logError(error, { component: 'useChecklistSubtasks', action: 'reorder', itemId })
        throw error
      }
    },
    onMutate: async ({ itemId, subtasks }) => {
      await queryClient.cancelQueries({ queryKey: ['checklist_subtasks', itemId] })
      const previousSubtasks = queryClient.getQueryData<ChecklistSubtask[]>([
        'checklist_subtasks',
        itemId,
      ])

      // Optimistically reorder
      queryClient.setQueryData<ChecklistSubtask[]>(['checklist_subtasks', itemId], subtasks)

      return { previousSubtasks }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['checklist_subtasks', variables.itemId] })
      toast.success('Sub-tasks reordered!', { icon: '↕️' })
    },
    onError: (error, variables, context) => {
      if (context?.previousSubtasks) {
        queryClient.setQueryData(['checklist_subtasks', variables.itemId], context.previousSubtasks)
      }
      toast.error(getUserFriendlyMessage(error))
    },
  })

  return {
    subtasks: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    addSubtask: createMutation.mutate,
    updateSubtask: updateMutation.mutate,
    deleteSubtask: deleteMutation.mutate,
    toggleSubtask: toggleMutation.mutate,
    reorderSubtasks: reorderMutation.mutate,
    isAdding: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isToggling: toggleMutation.isPending,
    isReordering: reorderMutation.isPending,
  }
}

// Hook to fetch subtasks for multiple items at once (for efficient rendering)
export function useChecklistSubtasksForItems(itemIds: string[]) {
  // queryClient not needed in this hook

  const query = useQuery({
    queryKey: ['checklist_subtasks_bulk', itemIds.sort().join(',')],
    queryFn: async () => {
      if (itemIds.length === 0) return {}

      const { data, error } = await supabase
        .from('checklist_subtasks' as any)
        .select('*')
        .in('item_id', itemIds)
        .order('order_index', { ascending: true })

      if (error) {
        logError(error, { component: 'useChecklistSubtasksForItems', action: 'fetch', itemIds })
        throw error
      }

      // Group by item_id
      const grouped = (data as unknown as ChecklistSubtask[]).reduce((acc, subtask) => {
        if (!acc[subtask.item_id]) {
          acc[subtask.item_id] = []
        }
        acc[subtask.item_id].push(subtask)
        return acc
      }, {} as Record<string, ChecklistSubtask[]>)

      return grouped
    },
    enabled: itemIds.length > 0,
    retry: 3,
    staleTime: 60000, // 1 minute
  })

  return {
    subtasksByItem: query.data || {},
    isLoading: query.isLoading,
    error: query.error,
  }
}
