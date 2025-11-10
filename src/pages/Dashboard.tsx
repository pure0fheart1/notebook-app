import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'

interface Notebook {
  id: string
  title: string
  icon?: string
  color?: string
  created_at: string
  updated_at: string
  notes_count?: number
}

export default function Dashboard() {
  const { user } = useAuth()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newNotebookTitle, setNewNotebookTitle] = useState('')
  const queryClient = useQueryClient()

  // Fetch notebooks
  const { data: notebooks = [], isLoading } = useQuery({
    queryKey: ['notebooks', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('notebooks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Notebook[]
    },
    enabled: !!user,
  })

  // Create notebook mutation
  const createNotebookMutation = useMutation({
    mutationFn: async (title: string) => {
      if (!user) throw new Error('User not found')

      const { data, error } = await supabase
        .from('notebooks')
        .insert({
          user_id: user.id,
          title,
          order_index: notebooks.length,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notebooks'] })
      setNewNotebookTitle('')
      setShowCreateForm(false)
      toast.success('Notebook created!')
    },
    onError: (error) => {
      toast.error('Failed to create notebook')
      console.error(error)
    },
  })

  // Delete notebook mutation
  const deleteNotebookMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notebooks')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notebooks'] })
      toast.success('Notebook deleted')
    },
    onError: () => {
      toast.error('Failed to delete notebook')
    },
  })

  const handleCreateNotebook = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNotebookTitle.trim()) {
      toast.error('Please enter a notebook title')
      return
    }
    await createNotebookMutation.mutateAsync(newNotebookTitle)
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.email?.split('@')[0]}!
        </h1>
        <p className="mt-2 text-gray-600">
          Organize your notes and manage your tasks efficiently
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6">
          <div className="text-sm font-medium text-gray-600">Total Notebooks</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{notebooks.length}</div>
        </div>
        <div className="card p-6">
          <div className="text-sm font-medium text-gray-600">Notes Created</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">--</div>
        </div>
        <div className="card p-6">
          <div className="text-sm font-medium text-gray-600">Tasks Completed</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">--</div>
        </div>
      </div>

      {/* Create Notebook Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Your Notebooks</h2>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary inline-flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            New Notebook
          </button>
        </div>

        {/* Create notebook form */}
        {showCreateForm && (
          <form onSubmit={handleCreateNotebook} className="card p-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notebook Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., Work Projects, Personal Notes..."
                  value={newNotebookTitle}
                  onChange={(e) => setNewNotebookTitle(e.target.value)}
                  className="input"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={createNotebookMutation.isPending}
                  className="btn-primary"
                >
                  {createNotebookMutation.isPending ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Notebooks grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : notebooks.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No notebooks yet</h3>
            <p className="mt-1 text-gray-600">Create your first notebook to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notebooks.map((notebook) => (
              <Link
                key={notebook.id}
                to={`/notebook/${notebook.id}`}
                className="card-hover group p-6 relative overflow-hidden"
              >
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-secondary-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {notebook.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {notebook.notes_count || 0} notes
                      </p>
                    </div>

                    {/* Action menu */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          // TODO: Edit notebook
                        }}
                        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          if (confirm('Delete this notebook?')) {
                            deleteNotebookMutation.mutate(notebook.id)
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Created {new Date(notebook.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}