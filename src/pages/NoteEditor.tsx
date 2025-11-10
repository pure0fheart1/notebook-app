import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/services/supabase'
import { useNotes } from '@/hooks/useNotes'
import { useChecklistItems } from '@/hooks/useChecklistItems'
import toast from 'react-hot-toast'
import {
  ArrowLeftIcon,
  StarIcon,
  TrashIcon,
  CheckCircleIcon,
  ListBulletIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

interface Note {
  id: string
  notebook_id: string
  title: string
  content: string
  is_checklist: boolean
  is_pinned: boolean
  created_at: string
  updated_at: string
}

export default function NoteEditor() {
  const { id: noteId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isChecklist, setIsChecklist] = useState(false)
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null)

  const { data: note, isLoading } = useQuery({
    queryKey: ['note', noteId],
    queryFn: async () => {
      if (!noteId) return null

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .single()

      if (error) throw error
      return data as Note
    },
    enabled: !!noteId,
  })

  const { items: checklistItems, addItem, toggleItem, deleteItem } = useChecklistItems(noteId)

  // Initialize form with note data
  useEffect(() => {
    if (note) {
      setTitle(note.title || '')
      setContent(note.content || '')
      setIsChecklist(note.is_checklist || false)
    }
  }, [note])

  // Auto-save note
  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<Note>) => {
      const { error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', noteId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note', noteId] })
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })

  // Delete note
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)

      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Note deleted')
      navigate(-1)
    },
    onError: () => {
      toast.error('Failed to delete note')
    },
  })

  // Pin/unpin note
  const pinMutation = useMutation({
    mutationFn: async () => {
      if (!note) return
      const { error } = await supabase
        .from('notes')
        .update({ is_pinned: !note.is_pinned })
        .eq('id', noteId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note', noteId] })
    },
  })

  // Handle title change with auto-save
  const handleTitleChange = useCallback(
    (newTitle: string) => {
      setTitle(newTitle)

      if (saveTimeout) clearTimeout(saveTimeout)
      const timeout = setTimeout(() => {
        updateMutation.mutate({ title: newTitle })
      }, 1000)
      setSaveTimeout(timeout)
    },
    [saveTimeout, updateMutation]
  )

  // Handle content change with auto-save
  const handleContentChange = useCallback(
    (newContent: string) => {
      setContent(newContent)

      if (saveTimeout) clearTimeout(saveTimeout)
      const timeout = setTimeout(() => {
        updateMutation.mutate({ content: newContent })
      }, 1000)
      setSaveTimeout(timeout)
    },
    [saveTimeout, updateMutation]
  )

  // Handle new checklist item
  const handleAddChecklistItem = () => {
    const itemText = prompt('Enter item text:')
    if (itemText && itemText.trim()) {
      addItem({ noteId: noteId!, text: itemText.trim() })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!note) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Note not found</h3>
        <button onClick={() => navigate(-1)} className="mt-4 btn-primary">
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => pinMutation.mutate()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={note.is_pinned ? 'Unpin note' : 'Pin note'}
          >
            {note.is_pinned ? (
              <StarIconSolid className="w-6 h-6 text-yellow-500" />
            ) : (
              <StarIcon className="w-6 h-6 text-gray-600" />
            )}
          </button>

          <button
            onClick={() => {
              if (confirm('Delete this note?')) {
                deleteMutation.mutate()
              }
            }}
            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
            title="Delete note"
          >
            <TrashIcon className="w-6 h-6 text-red-600" />
          </button>
        </div>
      </div>

      {/* Note type indicator */}
      <div className="flex items-center gap-2">
        {isChecklist ? (
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
            <CheckCircleIcon className="w-4 h-4" />
            Checklist
          </div>
        ) : (
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
            <ListBulletIcon className="w-4 h-4" />
            Note
          </div>
        )}
      </div>

      {/* Title */}
      <input
        type="text"
        placeholder="Note title..."
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
        className="text-3xl font-bold text-gray-900 bg-transparent border-none outline-none w-full placeholder-gray-400"
      />

      {/* Content */}
      {!isChecklist ? (
        <div className="card overflow-hidden">
          <ReactQuill
            theme="snow"
            value={content}
            onChange={handleContentChange}
            modules={{
              toolbar: [
                [{ header: [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link'],
                ['clean'],
              ],
            }}
            placeholder="Start typing..."
          />
        </div>
      ) : (
        <div className="card p-6 space-y-4">
          <div className="space-y-2">
            {checklistItems.map((item, index) => (
              <div key={item.id} className="flex items-center gap-3">
                <button
                  onClick={() => toggleItem(item.id)}
                  className={`flex-shrink-0 w-6 h-6 rounded border-2 transition-colors ${
                    item.checked
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300 hover:border-green-500'
                  }`}
                >
                  {item.checked && (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                <span
                  className={`flex-1 text-lg ${
                    item.checked ? 'line-through text-gray-400' : 'text-gray-900'
                  }`}
                >
                  {item.text}
                </span>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleAddChecklistItem}
            className="w-full py-2 text-center text-gray-600 hover:bg-gray-50 rounded-lg transition-colors border-2 border-dashed border-gray-300"
          >
            + Add item
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div>
          Created {new Date(note.created_at).toLocaleDateString()}
        </div>
        <div>
          Last edited {new Date(note.updated_at).toLocaleDateString()} at {new Date(note.updated_at).toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}