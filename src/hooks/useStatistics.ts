import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'
import { useAuth } from './useAuth'
import { logError } from '@/services/errorTracking'

export interface Statistics {
  totalNotebooks: number
  totalNotes: number
  totalTasks: number
  completedTasks: number
  completionRate: number
}

export function useStatistics() {
  const { user } = useAuth()

  const query = useQuery({
    queryKey: ['statistics', user?.id],
    queryFn: async (): Promise<Statistics> => {
      if (!user) {
        return {
          totalNotebooks: 0,
          totalNotes: 0,
          totalTasks: 0,
          completedTasks: 0,
          completionRate: 0,
        }
      }

      try {
        // Get total notebooks count
        const { count: notebooksCount, error: notebooksError } = await supabase
          .from('notebooks')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)

        if (notebooksError) {
          logError(notebooksError, { component: 'useStatistics', action: 'fetchNotebooks' })
          throw notebooksError
        }

        // Get total notes count across all notebooks
        const { count: notesCount, error: notesError } = await supabase
          .from('notes')
          .select('notebook_id, notebooks!inner(user_id)', { count: 'exact', head: true })
          .eq('notebooks.user_id', user.id)
          .eq('is_archived', false)

        if (notesError) {
          logError(notesError, { component: 'useStatistics', action: 'fetchNotes' })
          throw notesError
        }

        // Get total checklist items count and completed count
        const { data: checklistData, error: checklistError } = await supabase
          .from('checklist_items')
          .select('checked, note_id, notes!inner(notebook_id, notebooks!inner(user_id))')
          .eq('notes.notebooks.user_id', user.id)

        if (checklistError) {
          logError(checklistError, { component: 'useStatistics', action: 'fetchChecklistItems' })
          throw checklistError
        }

        const totalTasks = checklistData?.length || 0
        const completedTasks = checklistData?.filter((item: any) => item.checked).length || 0
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

        return {
          totalNotebooks: notebooksCount || 0,
          totalNotes: notesCount || 0,
          totalTasks,
          completedTasks,
          completionRate: Math.round(completionRate),
        }
      } catch (error) {
        logError(error, { component: 'useStatistics', action: 'fetchAll' })
        // Return zeros on error instead of throwing
        return {
          totalNotebooks: 0,
          totalNotes: 0,
          totalTasks: 0,
          completedTasks: 0,
          completionRate: 0,
        }
      }
    },
    enabled: !!user,
    retry: 2,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  })

  return {
    statistics: query.data || {
      totalNotebooks: 0,
      totalNotes: 0,
      totalTasks: 0,
      completedTasks: 0,
      completionRate: 0,
    },
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  }
}
