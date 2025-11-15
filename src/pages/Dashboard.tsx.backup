import { useState } from 'react'
import { useNotebooks } from '@/hooks/useNotebooks'
import { useAuth } from '@/hooks/useAuth'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import {
  PlusIcon,
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
    isCreating,
    isDeleting,
    maxTitleLength,
  } = useNotebooks()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newNotebookTitle, setNewNotebookTitle] = useState('')
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0].value)
  const [selectedIcon, setSelectedIcon] = useState(PRESET_ICONS[0])
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

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
      {/* Header with glassmorphism */}
      <div className="card-gradient p-8 border border-purple-500/20 relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-pink-500/10 animate-pulse-subtle" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-lg shadow-purple-500/30 relative">
              <SparklesIcon className="w-8 h-8 text-white" />
              <div className="absolute inset-0 blur-xl bg-purple-500/40" />
            </div>
            <h1 className="text-4xl font-bold text-white">
              Welcome back, <span className="text-gradient">{user?.email?.split('@')[0]}</span>!
            </h1>
          </div>
          <p className="mt-2 text-lg text-gray-300 ml-14">
            Organize your notes and manage your tasks efficiently
          </p>
        </div>
      </div>

      {/* Quick stats with glassmorphism cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-hover p-6 group border border-purple-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl border border-purple-500/30 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/20">
                <BookOpenIcon className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-4xl font-bold text-gradient">{notebooks.length}</div>
            </div>
            <div className="text-sm font-medium text-gray-300">Total Notebooks</div>
            <div className="mt-3 h-1.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-lg shadow-purple-500/50"></div>
          </div>
        </div>

        <div className="card-hover p-6 group border border-blue-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/30 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/20">
                <DocumentTextIcon className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                --
              </div>
            </div>
            <div className="text-sm font-medium text-gray-300">Notes Created</div>
            <div className="mt-3 h-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-lg shadow-blue-500/50"></div>
          </div>
        </div>

        <div className="card-hover p-6 group border border-green-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-green-500/20">
                <CheckCircleIcon className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-400">
                --
              </div>
            </div>
            <div className="text-sm font-medium text-gray-300">Tasks Completed</div>
            <div className="mt-3 h-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg shadow-green-500/50"></div>
          </div>
        </div>
      </div>

      {/* Notebooks Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            Your <span className="text-gradient">Notebooks</span>
          </h2>
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
              <h3 className="text-2xl font-bold text-white mb-3">
                No notebooks yet
              </h3>
              <p className="text-gray-300 mb-6 text-lg">
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
              <div className="mt-8 pt-8 border-t border-white/10">
                <h4 className="text-sm font-semibold text-white mb-3">
                  💡 Quick Tips:
                </h4>
                <ul className="text-sm text-gray-300 space-y-2 text-left">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span>Create notebooks for different areas of your life</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span>Customize with colors and icons</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
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
                className="card-hover group p-6 relative overflow-hidden border border-white/10"
              >
                {/* Background gradient on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                  background: `linear-gradient(135deg, ${notebook.color || '#8b5cf6'}20 0%, transparent 100%)`
                }} />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      {/* Icon with color and glow */}
                      <div className="relative mb-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg text-2xl"
                          style={{
                            backgroundColor: notebook.color || '#8b5cf6',
                            boxShadow: `0 8px 24px ${notebook.color || '#8b5cf6'}40`
                          }}
                        >
                          {notebook.icon || '📓'}
                        </div>
                        <div className="absolute inset-0 blur-xl opacity-0 group-hover:opacity-60 transition-opacity" style={{
                          background: notebook.color || '#8b5cf6'
                        }} />
                      </div>

                      <h3 className="text-xl font-bold text-white group-hover:text-gradient transition-colors mb-2">
                        {notebook.title}
                      </h3>
                      <p className="text-sm text-gray-400 flex items-center gap-1">
                        <DocumentTextIcon className="w-4 h-4" />
                        0 notes
                      </p>
                    </div>

                    {/* Action menu */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          setDeleteConfirm(notebook.id)
                        }}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/30"
                        title="Delete notebook"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 group-hover:border-purple-500/30 transition-colors">
                    <p className="text-xs text-gray-400 flex items-center justify-between">
                      <span>Created {new Date(notebook.created_at).toLocaleDateString()}</span>
                      <span className="text-purple-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
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
                <h2 className="text-2xl font-bold text-white">
                  Create <span className="text-gradient">New Notebook</span>
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateNotebook} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
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
                  <p className="text-xs text-gray-400 mt-1">
                    {newNotebookTitle.length}/{maxTitleLength} characters
                  </p>
                </div>

                {/* Color Picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Choose Color
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setSelectedColor(color.value)}
                        className={`w-full aspect-square rounded-lg transition-all border-2 ${
                          selectedColor === color.value
                            ? 'border-white scale-110 shadow-lg'
                            : 'border-transparent hover:scale-110'
                        }`}
                        style={{
                          backgroundColor: color.value,
                          boxShadow: selectedColor === color.value ? `0 8px 20px ${color.value}60` : 'none'
                        }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Icon Picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Choose Icon
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {PRESET_ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setSelectedIcon(icon)}
                        className={`text-2xl p-3 rounded-lg transition-all border ${
                          selectedIcon === icon
                            ? 'bg-purple-500/20 border-purple-500/30 ring-2 ring-purple-500/50'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="p-4 glass rounded-lg border border-white/10">
                  <p className="text-xs font-medium text-gray-300 mb-2">Preview:</p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow-lg"
                      style={{
                        backgroundColor: selectedColor,
                        boxShadow: `0 8px 20px ${selectedColor}60`
                      }}
                    >
                      {selectedIcon}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">
                        {newNotebookTitle || 'Untitled Notebook'}
                      </div>
                      <div className="text-xs text-gray-400">0 notes</div>
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
