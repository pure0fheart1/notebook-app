import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'
import { useAuth } from '@/hooks/useAuth'
import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline'

interface Note {
  id: string
  title: string
  content?: any
  is_checklist: boolean
  created_at: string
  updated_at: string
}

export default function NotebookView() {
  const { id: notebookId } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: notebook, isLoading: notebookLoading } = useQuery({
    queryKey: ['notebook', notebookId],
    queryFn: async () => {
      if (!notebookId) return null

      const { data, error } = await supabase
        .from('notebooks')
        .select('*')
        .eq('id', notebookId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!notebookId,
  })

  const { data: notes = [], isLoading: notesLoading } = useQuery({
    queryKey: ['notes', notebookId],
    queryFn: async () => {
      if (!notebookId) return []

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('notebook_id', notebookId)
        .order('updated_at', { ascending: false })

      if (error) throw error
      return data as Note[]
    },
    enabled: !!notebookId,
  })

  if (notebookLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!notebook) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Notebook not found</h3>
        <button onClick={() => navigate('/dashboard')} className="mt-4 btn-primary">
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{notebook.title}</h1>
          <p className="text-sm text-gray-600 mt-1">{notes.length} notes</p>
        </div>
        <button className="btn-primary inline-flex items-center">
          <PlusIcon className="w-5 h-5 mr-2" />
          New Note
        </button>
      </div>

      {/* Notes list */}
      {notesLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : notes.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No notes yet</h3>
          <p className="mt-1 text-gray-600">Create your first note to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <button
              key={note.id}
              onClick={() => navigate(`/note/${note.id}`)}
              className="card-hover w-full text-left p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{note.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {typeof note.content === 'string'
                      ? note.content
                      : 'Click to view note'}
                  </p>
                </div>
                <span className="ml-4 px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded">
                  {note.is_checklist ? 'Checklist' : 'Note'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                {new Date(note.updated_at).toLocaleDateString()}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}