import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'
import { useAuth } from './useAuth'
import toast from 'react-hot-toast'
import { logError, getUserFriendlyMessage } from '@/services/errorTracking'

export interface Notebook {
  id: string
  title: string
  user_id: string
  icon?: string | null
  color?: string | null
  order_index: number
  is_archived: boolean
  created_at: string
  updated_at: string
}

const MAX_TITLE_LENGTH = 100

export function useNotebooks() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['notebooks', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('notebooks')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .order('order_index', { ascending: true })

      if (error) {
        logError(error, {
          component: 'useNotebooks',
          action: 'fetchNotebooks',
          user: { id: user.id, email: user.email }
        })
        throw error
      }
      return data as Notebook[]
    },
    enabled: !!user,
    staleTime: 60 * 1000, // 1 minute
    retry: 3,
  })

  const createMutation = useMutation({
    mutationFn: async (params: { title: string; icon?: string; color?: string }) => {
      if (!user) throw new Error('User not found')

      const trimmedTitle = params.title.trim()

      // Validation
      if (!trimmedTitle) {
        throw new Error('Please enter a notebook title')
      }

      if (trimmedTitle.length > MAX_TITLE_LENGTH) {
        throw new Error(`Title must be ${MAX_TITLE_LENGTH} characters or less`)
      }

      // Check for duplicates in cache
      const currentNotebooks = queryClient.getQueryData<Notebook[]>(['notebooks', user.id]) || []
      const isDuplicate = currentNotebooks.some(
        nb => nb.title.toLowerCase() === trimmedTitle.toLowerCase()
      )

      if (isDuplicate) {
        throw new Error('A notebook with this name already exists')
      }

      // Get latest count from database to avoid race condition
      const { count, error: countError } = await supabase
        .from('notebooks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_archived', false)

      if (countError) throw countError

      const { data, error } = await supabase
        .from('notebooks')
        .insert({
          user_id: user.id,
          title: trimmedTitle,
          icon: params.icon || null,
          color: params.color || null,
          order_index: count || 0,
          is_archived: false,
        })
        .select()
        .single()

      if (error) throw error
      return data as Notebook
    },
    onMutate: async (params) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['notebooks', user?.id] })

      // Snapshot previous value
      const previousNotebooks = queryClient.getQueryData<Notebook[]>(['notebooks', user?.id])

      // Optimistically update
      if (user) {
        const optimisticNotebook: Notebook = {
          id: `temp-${Date.now()}`,
          user_id: user.id,
          title: params.title.trim(),
          icon: params.icon || null,
          color: params.color || null,
          order_index: previousNotebooks?.length || 0,
          is_archived: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        queryClient.setQueryData<Notebook[]>(
          ['notebooks', user.id],
          (old = []) => [...old, optimisticNotebook]
        )
      }

      return { previousNotebooks }
    },
    onError: (error: Error, params, context) => {
      // Rollback on error
      if (context?.previousNotebooks && user) {
        queryClient.setQueryData(
          ['notebooks', user.id],
          context.previousNotebooks
        )
      }

      logError(error, {
        component: 'useNotebooks',
        action: 'createNotebook',
        user: user ? { id: user.id, email: user.email } : undefined,
        metadata: { title: params.title }
      })

      const message = getUserFriendlyMessage(error)
      toast.error(message, {
        duration: 5000,
        icon: '❌'
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notebooks', user?.id] })
      toast.success('Notebook created successfully!', {
        icon: '✨',
        duration: 3000,
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Notebook> & { id: string }) => {
      if (updates.title) {
        const trimmedTitle = updates.title.trim()
        if (!trimmedTitle) {
          throw new Error('Please enter a notebook title')
        }
        if (trimmedTitle.length > MAX_TITLE_LENGTH) {
          throw new Error(`Title must be ${MAX_TITLE_LENGTH} characters or less`)
        }
        updates.title = trimmedTitle
      }

      const { data, error } = await supabase
        .from('notebooks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Notebook
    },
    onMutate: async (updatedNotebook) => {
      await queryClient.cancelQueries({ queryKey: ['notebooks', user?.id] })
      const previousNotebooks = queryClient.getQueryData<Notebook[]>(['notebooks', user?.id])

      if (user) {
        queryClient.setQueryData<Notebook[]>(
          ['notebooks', user.id],
          (old = []) => old.map(nb =>
            nb.id === updatedNotebook.id ? { ...nb, ...updatedNotebook } : nb
          )
        )
      }

      return { previousNotebooks }
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousNotebooks && user) {
        queryClient.setQueryData(['notebooks', user.id], context.previousNotebooks)
      }

      logError(error, {
        component: 'useNotebooks',
        action: 'updateNotebook',
        user: user ? { id: user.id, email: user.email } : undefined
      })

      toast.error(getUserFriendlyMessage(error), { duration: 4000 })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notebooks', user?.id] })
      toast.success('Notebook updated!')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notebooks')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ['notebooks', user?.id] })
      const previousNotebooks = queryClient.getQueryData<Notebook[]>(['notebooks', user?.id])

      if (user) {
        queryClient.setQueryData<Notebook[]>(
          ['notebooks', user.id],
          (old = []) => old.filter(nb => nb.id !== deletedId)
        )
      }

      return { previousNotebooks }
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousNotebooks && user) {
        queryClient.setQueryData(['notebooks', user.id], context.previousNotebooks)
      }

      logError(error, {
        component: 'useNotebooks',
        action: 'deleteNotebook',
        user: user ? { id: user.id, email: user.email } : undefined
      })

      toast.error(getUserFriendlyMessage(error), { duration: 4000 })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notebooks', user?.id] })
      toast.success('Notebook deleted', { icon: '🗑️' })
    },
  })

  return {
    notebooks: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createNotebook: createMutation.mutate,
    updateNotebook: updateMutation.mutate,
    deleteNotebook: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    maxTitleLength: MAX_TITLE_LENGTH,
  }
}