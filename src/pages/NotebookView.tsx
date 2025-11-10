import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'
import { useNotes } from '@/hooks/useNotes'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import {
  ArrowLeftIcon,
  PlusIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  BookOpenIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { PencilSquareIcon as PencilSquareSolidIcon } from '@heroicons/react/24/solid'

export default function NotebookView() {
  const { id: notebookId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null)

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

  const { notes, isLoading: notesLoading, deleteNote, pinNote, isPinning, isDeleting } =
    useNotes(notebookId)

  // Calculate stats
  const totalNotes = notes.length
  const checklistCount = notes.filter((n) => n.is_checklist).length
  const pinnedCount = notes.filter((n) => n.is_pinned).length

  const handleCreateNote = (isChecklist: boolean) => {
    if (!notebookId) return
    navigate(`/note/new?notebookId=${notebookId}&isChecklist=${isChecklist}`)
  }

  const handleDeleteClick = (noteId: string) => {
    setNoteToDelete(noteId)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (noteToDelete) {
      deleteNote(noteToDelete)
      setDeleteConfirmOpen(false)
      setNoteToDelete(null)
    }
  }

  const handlePinNote = (e: React.MouseEvent, noteId: string) => {
    e.preventDefault()
    e.stopPropagation()
    pinNote(noteId)
  }

  // Loading skeleton
  if (notebookLoading) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        {/* Header skeleton */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 skeleton rounded-lg" />
          <div className="flex-1">
            <div className="h-8 w-64 skeleton rounded mb-2" />
            <div className="h-4 w-32 skeleton rounded" />
          </div>
          <div className="flex gap-2">
            <div className="w-24 h-10 skeleton rounded-lg" />
            <div className="w-28 h-10 skeleton rounded-lg" />
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4">
              <div className="h-12 w-12 skeleton rounded-lg mb-3" />
              <div className="h-6 w-16 skeleton rounded mb-1" />
              <div className="h-4 w-20 skeleton rounded" />
            </div>
          ))}
        </div>

        {/* Notes skeleton */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4">
              <div className="h-6 w-48 skeleton rounded mb-2" />
              <div className="h-4 w-full skeleton rounded mb-1" />
              <div className="h-4 w-3/4 skeleton rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!notebook) {
    return (
      <div className="min-h-screen flex items-center justify-center animate-fade-in">
        <div className="text-center p-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <BookOpenIcon className="w-10 h-10 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Notebook not found</h3>
          <p className="text-gray-600 mb-6">
            This notebook doesn't exist or you don't have access to it.
          </p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const notebookColor = notebook.color || '#4f46e5'
  const notebookIcon = notebook.icon || '📓'

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Enhanced Header with Gradient */}
      <div className="card-gradient overflow-hidden">
        <div
          className="h-2 w-full"
          style={{
            background: `linear-gradient(to right, ${notebookColor}, ${notebookColor}dd)`,
          }}
        />
        <div className="p-6">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 mt-1"
              title="Back to Dashboard"
            >
              <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
            </button>

            {/* Notebook Icon and Title */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shadow-soft transition-transform duration-200 hover:scale-110"
                  style={{ backgroundColor: notebookColor }}
                >
                  {notebookIcon}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">{notebook.title}</h1>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <DocumentTextIcon className="w-4 h-4" />
                    {totalNotes} {totalNotes === 1 ? 'note' : 'notes'}
                    {pinnedCount > 0 && (
                      <span className="ml-3 flex items-center gap-1">
                        📌 {pinnedCount} pinned
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => handleCreateNote(false)}
                className="btn-secondary group"
                title="Create Note"
              >
                <PlusIcon className="w-5 h-5 transition-transform group-hover:rotate-90" />
                <span className="hidden sm:inline">Note</span>
              </button>
              <button
                onClick={() => handleCreateNote(true)}
                className="btn-primary group"
                title="Create Checklist"
              >
                <PlusIcon className="w-5 h-5 transition-transform group-hover:rotate-90" />
                <span className="hidden sm:inline">Checklist</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Notes */}
        <div className="card-hover p-4 group">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform">
              <DocumentTextIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gradient">{totalNotes}</p>
              <p className="text-sm text-gray-600">Total Notes</p>
            </div>
          </div>
        </div>

        {/* Checklists */}
        <div className="card-hover p-4 group">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success-500 to-success-600 flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform">
              <CheckCircleIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold bg-gradient-to-r from-success-600 to-success-700 bg-clip-text text-transparent">
                {checklistCount}
              </p>
              <p className="text-sm text-gray-600">Checklists</p>
            </div>
          </div>
        </div>

        {/* Pinned */}
        <div className="card-hover p-4 group">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary-500 to-secondary-600 flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform">
              <span className="text-2xl">📌</span>
            </div>
            <div>
              <p className="text-2xl font-bold bg-gradient-to-r from-secondary-600 to-secondary-700 bg-clip-text text-transparent">
                {pinnedCount}
              </p>
              <p className="text-sm text-gray-600">Pinned</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notes List */}
      {notesLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="h-6 w-64 skeleton rounded" />
                  <div className="h-4 w-full skeleton rounded" />
                  <div className="h-4 w-3/4 skeleton rounded" />
                </div>
                <div className="h-6 w-20 skeleton rounded" />
              </div>
              <div className="h-3 w-24 skeleton rounded mt-3" />
            </div>
          ))}
        </div>
      ) : notes.length === 0 ? (
        // Enhanced Empty State
        <div className="card p-12 text-center">
          <div className="max-w-md mx-auto">
            {/* Animated Illustration */}
            <div className="mb-6 relative">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center animate-bounce-subtle">
                <PencilSquareSolidIcon className="w-12 h-12 text-primary-600" />
              </div>
              <div className="absolute top-0 right-1/4 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center animate-pulse">
                ✨
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">No notes yet</h3>
            <p className="text-gray-600 mb-6">
              Start capturing your ideas, thoughts, and tasks in this notebook
            </p>

            {/* Quick Actions */}
            <div className="flex gap-3 justify-center mb-8">
              <button onClick={() => handleCreateNote(false)} className="btn-primary">
                <PlusIcon className="w-5 h-5" />
                Create Note
              </button>
              <button onClick={() => handleCreateNote(true)} className="btn-secondary">
                <PlusIcon className="w-5 h-5" />
                Create Checklist
              </button>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 text-left">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                💡 Quick Tips
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 font-bold">•</span>
                  <span>
                    Use <strong>Notes</strong> for rich text content with formatting
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success-600 font-bold">•</span>
                  <span>
                    Use <strong>Checklists</strong> for to-do lists and task tracking
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary-600 font-bold">•</span>
                  <span>
                    Pin important notes to keep them at the top
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        // Notes Grid
        <div className="space-y-3">
          {notes.map((note) => {
            

            return (
              <Link
                key={note.id}
                to={`/note/${note.id}`}
                className="card-hover p-5 group relative block"
              >
                {/* Pin Indicator */}
                {note.is_pinned && (
                  <div className="absolute top-3 right-3 text-xl animate-pulse">📌</div>
                )}

                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors text-lg mb-2 flex items-center gap-2">
                      {note.is_checklist ? (
                        <CheckCircleIcon className="w-5 h-5 text-success-600 flex-shrink-0" />
                      ) : (
                        <DocumentTextIcon className="w-5 h-5 text-primary-600 flex-shrink-0" />
                      )}
                      <span className="truncate">{note.title || 'Untitled'}</span>
                    </h3>

                    {/* Content Preview */}
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {typeof note.content === 'string'
                        ? note.content.replace(/<[^>]*>/g, '').trim() || 'Empty note'
                        : 'Click to view checklist'}
                    </p>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        🕐 {new Date(note.updated_at).toLocaleDateString()}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full font-medium ${
                          note.is_checklist
                            ? 'bg-success-50 text-success-700'
                            : 'bg-primary-50 text-primary-700'
                        }`}
                      >
                        {note.is_checklist ? '✓ Checklist' : '📝 Note'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons (appear on hover) */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handlePinNote(e, note.id)}
                      disabled={isPinning}
                      className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                        note.is_pinned
                          ? 'bg-secondary-100 text-secondary-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={note.is_pinned ? 'Unpin note' : 'Pin note'}
                    >
                      📌
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        navigate(`/note/${note.id}`)
                      }}
                      className="p-2 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200 transition-all duration-200 hover:scale-110"
                      title="Edit note"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleDeleteClick(note.id)
                      }}
                      disabled={isDeleting}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all duration-200 hover:scale-110"
                      title="Delete note"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Hover indicator */}
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-sm text-primary-600 font-medium">
                  Open →
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Note"
        message={`Are you sure you want to delete "${
          notes.find((n) => n.id === noteToDelete)?.title || 'this note'
        }"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}
