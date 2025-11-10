import { useState } from 'react'
import { useNotebooks } from '@/hooks/useNotebooks'
import { useAuth } from '@/hooks/useAuth'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BookOpenIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  SparklesIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'

const PRESET_COLORS = [
  { name: 'Indigo', value: '#4f46e5' },
  { name: 'Purple', value: '#a21caf' },
  { name: 'Green', value: '#16a34a' },
  { name: 'Red', value: '#dc2626' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Pink', value: '#ec4899' },
]

const PRESET_ICONS = ['📓', '📚', '📖', '📝', '✏️', '📔', '💼', '🎨', '🔬', '💡']

export default function Dashboard() {
  const { user } = useAuth()
  const {
    notebooks,
    isLoading,
    createNotebook,
    deleteNotebook,
    updateNotebook,
    isCreating,
    isDeleting,
    maxTitleLength,
  } = useNotebooks()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newNotebookTitle, setNewNotebookTitle] = useState('')
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0].value)
  const [selectedIcon, setSelectedIcon] = useState(PRESET_ICONS[0])
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [editingNotebook, setEditingNotebook] = useState<string | null>(null)

  const handleCreateNotebook = async (e: React.FormEvent) => {
    e.preventDefault()

    createNotebook(
      {
        title: newNotebookTitle,
        icon: selectedIcon,
        color: selectedColor,
      },
      {
        onSuccess: () => {
          setNewNotebookTitle('')
          setShowCreateModal(false)
          setSelectedColor(PRESET_COLORS[0].value)
          setSelectedIcon(PRESET_ICONS[0])
        },
      }
    )
  }

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card p-6 animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-8 border border-primary-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-md">
            <SparklesIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome back, {user?.email?.split('@')[0]}!
          </h1>
        </div>
        <p className="mt-2 text-lg text-gray-600 ml-14">
          Organize your notes and manage your tasks efficiently
        </p>
      </div>

      {/* Quick stats with icons and gradients */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-gradient p-6 group hover:shadow-medium transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <BookOpenIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div className="text-4xl font-bold text-gradient">{notebooks.length}</div>
          </div>
          <div className="text-sm font-medium text-gray-600">Total Notebooks</div>
          <div className="mt-2 h-1 bg-gradient-to-r from-primary-500 to-primary-300 rounded-full"></div>
        </div>

        <div className="card-gradient p-6 group hover:shadow-medium transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <DocumentTextIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
              --
            </div>
          </div>
          <div className="text-sm font-medium text-gray-600">Notes Created</div>
          <div className="mt-2 h-1 bg-gradient-to-r from-blue-500 to-blue-300 rounded-full"></div>
        </div>

        <div className="card-gradient p-6 group hover:shadow-medium transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-success-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <CheckCircleIcon className="w-6 h-6 text-success-600" />
            </div>
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-success-600 to-success-400">
              --
            </div>
          </div>
          <div className="text-sm font-medium text-gray-600">Tasks Completed</div>
          <div className="mt-2 h-1 bg-gradient-to-r from-success-500 to-success-300 rounded-full"></div>
        </div>
      </div>

      {/* Notebooks Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Notebooks</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            <PlusIcon className="w-5 h-5" />
            New Notebook
          </button>
        </div>

        {/* Notebooks grid */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : notebooks.length === 0 ? (
          <div className="card p-16 text-center">
            <div className="max-w-md mx-auto">
              {/* Animated illustration */}
              <div className="mb-6 animate-bounce-subtle">
                <svg
                  className="mx-auto h-32 w-32 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No notebooks yet
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
                Create your first notebook to start organizing your notes and ideas
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                <PlusIcon className="w-5 h-5" />
                Create Your First Notebook
              </button>

              {/* Tips */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  💡 Quick Tips:
                </h4>
                <ul className="text-sm text-gray-600 space-y-2 text-left">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 mt-0.5">•</span>
                    <span>Create notebooks for different areas of your life</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 mt-0.5">•</span>
                    <span>Customize with colors and icons</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 mt-0.5">•</span>
                    <span>Add notes and checklists to each notebook</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notebooks.map((notebook) => (
              <Link
                key={notebook.id}
                to={`/notebook/${notebook.id}`}
                className="card-hover group p-6 relative overflow-hidden"
              >
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-secondary-50 to-primary-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      {/* Icon with color */}
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md text-2xl"
                        style={{
                          backgroundColor: notebook.color || '#4f46e5',
                        }}
                      >
                        {notebook.icon || '📓'}
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
                        {notebook.title}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <DocumentTextIcon className="w-4 h-4" />
                        {notebook.notes_count || 0} notes
                      </p>
                    </div>

                    {/* Action menu */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          setEditingNotebook(notebook.id)
                        }}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                        title="Edit notebook"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          setDeleteConfirm(notebook.id)
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete notebook"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 group-hover:border-primary-200 transition-colors">
                    <p className="text-xs text-gray-500 flex items-center justify-between">
                      <span>Created {new Date(notebook.created_at).toLocaleDateString()}</span>
                      <span className="text-primary-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Open →
                      </span>
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create Notebook Modal */}
      {showCreateModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="modal-content w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Create New Notebook
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateNotebook} className="space-y-4">
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
                    maxLength={maxTitleLength}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {newNotebookTitle.length}/{maxTitleLength} characters
                  </p>
                </div>

                {/* Color Picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose Color
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setSelectedColor(color.value)}
                        className={`w-full aspect-square rounded-lg transition-all ${
                          selectedColor === color.value
                            ? 'ring-2 ring-offset-2 ring-primary-500 scale-110'
                            : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Icon Picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose Icon
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {PRESET_ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setSelectedIcon(icon)}
                        className={`text-2xl p-3 rounded-lg transition-all ${
                          selectedIcon === icon
                            ? 'bg-primary-100 ring-2 ring-primary-500'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-600 mb-2">Preview:</p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow-sm"
                      style={{ backgroundColor: selectedColor }}
                    >
                      {selectedIcon}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {newNotebookTitle || 'Untitled Notebook'}
                      </div>
                      <div className="text-xs text-gray-500">0 notes</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isCreating || !newNotebookTitle.trim()}
                    className="btn-primary flex-1"
                  >
                    {isCreating ? (
                      <>
                        <div className="spinner" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <PlusIcon className="w-5 h-5" />
                        Create
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn-secondary"
                    disabled={isCreating}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) {
            deleteNotebook(deleteConfirm)
            setDeleteConfirm(null)
          }
        }}
        title="Delete Notebook?"
        message={`Are you sure you want to delete "${notebooks.find(n => n.id === deleteConfirm)?.title}"? This action cannot be undone and will delete all notes inside.`}
        confirmText="Delete"
        isLoading={isDeleting}
      />
    </div>
  )
}
