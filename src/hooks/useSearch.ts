import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'
import { useAuth } from './useAuth'

export interface SearchResult {
  id: string
  type: 'notebook' | 'note'
  title: string
  content?: string
  notebookId?: string
  notebookTitle?: string
  created_at: string
  updated_at: string
}

export function useSearch() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')

  // Fetch all user's notes for client-side search
  const { data: allNotes = [] } = useQuery({
    queryKey: ['all-notes', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('notes')
        .select(`
          id,
          title,
          content,
          notebook_id,
          is_checklist,
          created_at,
          updated_at,
          notebooks(id, title)
        `)
        .eq('notebooks.user_id', user.id)

      if (error) throw error
      return data || []
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Fetch all user's notebooks
  const { data: allNotebooks = [] } = useQuery({
    queryKey: ['all-notebooks', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('notebooks')
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error
      return data || []
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })

  // Perform client-side search and filtering
  const results: SearchResult[] = useMemo(() => {
    if (!query.trim()) return []

    const searchTerm = query.toLowerCase()
    const searchResults: SearchResult[] = []

    // Search notebooks
    allNotebooks.forEach((notebook) => {
      if (notebook.title.toLowerCase().includes(searchTerm)) {
        searchResults.push({
          id: notebook.id,
          type: 'notebook',
          title: notebook.title,
          created_at: notebook.created_at,
          updated_at: notebook.updated_at,
        })
      }
    })

    // Search notes
    allNotes.forEach((note: any) => {
      const titleMatch = note.title?.toLowerCase().includes(searchTerm)
      const contentMatch = note.content?.toLowerCase().includes(searchTerm)

      if (titleMatch || contentMatch) {
        searchResults.push({
          id: note.id,
          type: 'note',
          title: note.title || 'Untitled',
          content: typeof note.content === 'string'
            ? note.content.substring(0, 100)
            : '',
          notebookId: note.notebook_id,
          notebookTitle: note.notebooks?.title,
          created_at: note.created_at,
          updated_at: note.updated_at,
        })
      }
    })

    // Sort by relevance (title matches first) and date
    return searchResults.sort((a, b) => {
      const aTitle = a.title.toLowerCase()
      const bTitle = b.title.toLowerCase()
      const aStartsWith = aTitle.startsWith(searchTerm) ? 0 : 1
      const bStartsWith = bTitle.startsWith(searchTerm) ? 0 : 1

      if (aStartsWith !== bStartsWith) return aStartsWith - bStartsWith
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })
  }, [query, allNotes, allNotebooks])

  return {
    query,
    setQuery,
    results,
    hasResults: results.length > 0,
    isLoading: !allNotes || !allNotebooks,
  }
}