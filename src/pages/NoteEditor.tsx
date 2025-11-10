import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function NoteEditor() {
  const { id: noteId } = useParams<{ id: string }>()
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Note Editor</h1>
      </div>

      {/* Placeholder */}
      <div className="card p-12 text-center">
        <p className="text-gray-600">Note editor coming soon...</p>
        <p className="text-sm text-gray-500 mt-2">Note ID: {noteId}</p>
      </div>
    </div>
  )
}