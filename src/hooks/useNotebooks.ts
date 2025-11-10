import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'
import { useAuth } from './useAuth'
import toast from 'react-hot-toast'

export interface Notebook {
  id: string
  title: string
  icon?: string | null
  color?: string | null
  order_index: number
  is_archived: boolean
  created_at: string
  updated_at: string
}

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
        .order('order_index', { ascending: true })

      if (error) throw error
      return data as Notebook[]
    },
    enabled: !!user,
  })

  const createMutation = useMutation({
    mutationFn: async (title: string) => {
      if (!user) throw new Error('User not found')

      const { data, error } = await supabase
        .from('notebooks')
        .insert({
          user_id: user.id,
          title,
          order_index: query.data?.length || 0,
        })
        .select()
        .single()

      if (error) throw error
      return data as Notebook
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notebooks'] })
      toast.success('Notebook created!')
    },
    onError: () => {
      toast.error('Failed to create notebook')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Notebook> & { id: string }) => {
      const { data, error } = await supabase
        .from('notebooks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Notebook
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notebooks'] })
      toast.success('Notebook updated!')
    },
    onError: () => {
      toast.error('Failed to update notebook')
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notebooks'] })
      toast.success('Notebook deleted!')
    },
    onError: () => {
      toast.error('Failed to delete notebook')
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
  }
}