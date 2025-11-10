import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { supabase } from '@/services/supabase'
import { useChecklistItems } from '@/hooks/useChecklistItems'
import { useChecklistSubtasksForItems } from '@/hooks/useChecklistSubtasks'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import toast from 'react-hot-toast'
import {
  ArrowLeftIcon,
  TrashIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  CloudIcon,
  CheckIcon,
  PlusIcon,
  XMarkIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'
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
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isChecklist, setIsChecklist] = useState(false)
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [addItemModalOpen, setAddItemModalOpen] = useState(false)
  const [newItemText, setNewItemText] = useState('')
  const [addSubtaskModalOpen, setAddSubtaskModalOpen] = useState(false)
  const [newSubtaskText, setNewSubtaskText] = useState('')
  const [selectedParentItemId, setSelectedParentItemId] = useState<string | null>(null)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const isNewNote = noteId === 'new'
  const notebookId = searchParams.get('notebookId')
  const isChecklistParam = searchParams.get('isChecklist') === 'true'

  // Fetch note data
  const { data: note, isLoading } = useQuery({
    queryKey: ['note', noteId],
    queryFn: async () => {
      if (!noteId || isNewNote) return null

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .single()

      if (error) throw error
      return data as Note
    },
    enabled: !!noteId && !isNewNote,
  })

  const { items: checklistItems, addItem, toggleItem, deleteItem, isAdding } =
    useChecklistItems(isNewNote ? undefined : noteId)

  // Fetch subtasks for all checklist items
  const itemIds = checklistItems.map((item) => item.id)
  const { subtasksByItem } = useChecklistSubtasksForItems(itemIds)

  // Initialize form with note data
  useEffect(() => {
    if (note) {
      setTitle(note.title || '')
      setContent(note.content || '')
      setIsChecklist(note.is_checklist || false)
    } else if (isNewNote) {
      setTitle('')
      setContent('')
      setIsChecklist(isChecklistParam)
    }
  }, [note, isNewNote, isChecklistParam])

  // Create new note mutation
  const createNoteMutation = useMutation({
    mutationFn: async (data: {
      title: string
      content: string
      isChecklist: boolean
    }) => {
      if (!notebookId) throw new Error('Notebook ID required')

      const { data: newNote, error } = await supabase
        .from('notes')
        .insert({
          notebook_id: notebookId,
          title: data.title.trim(),
          content: data.content,
          is_checklist: data.isChecklist,
        })
        .select()
        .single()

      if (error) throw error
      return newNote as Note
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notes', notebookId] })
      toast.success('Note created!', { icon: '✨' })
      navigate(`/note/${data.id}`, { replace: true })
    },
    onError: () => {
      toast.error('Failed to create note')
    },
  })

  // Auto-save note
  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<Note>) => {
      if (!noteId || isNewNote) return

      const { error } = await supabase.from('notes').update(updates).eq('id', noteId)

      if (error) throw error
    },
    onMutate: () => {
      setIsSaving(true)
    },
    onSuccess: () => {
      if (noteId) {
        queryClient.invalidateQueries({ queryKey: ['note', noteId] })
        queryClient.invalidateQueries({ queryKey: ['notes'] })
      }
      setLastSaved(new Date())
      setIsSaving(false)
    },
    onError: () => {
      setIsSaving(false)
      toast.error('Failed to save')
    },
  })

  // Delete note
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!noteId || isNewNote) throw new Error('Note ID not found')
      const { error } = await supabase.from('notes').delete().eq('id', noteId)

      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Note deleted!', { icon: '🗑️' })
      navigate(-1)
    },
    onError: () => {
      toast.error('Failed to delete note')
    },
  })

  // Pin/unpin note
  const pinMutation = useMutation({
    mutationFn: async () => {
      if (!note || !noteId || isNewNote) return
      const { error } = await supabase
        .from('notes')
        .update({ is_pinned: !note.is_pinned })
        .eq('id', noteId)

      if (error) throw error
    },
    onSuccess: () => {
      if (noteId) {
        queryClient.invalidateQueries({ queryKey: ['note', noteId] })
      }
      toast.success(note?.is_pinned ? 'Note unpinned!' : 'Note pinned!', {
        icon: note?.is_pinned ? '📍' : '📌',
      })
    },
  })

  // Handle title change with auto-save
  const handleTitleChange = useCallback(
    (newTitle: string) => {
      setTitle(newTitle)

      if (isNewNote) {
        // For new notes, we'll create on first content save
        return
      }

      if (saveTimeout) clearTimeout(saveTimeout)
      const timeout = setTimeout(() => {
        updateMutation.mutate({ title: newTitle })
      }, 1000)
      setSaveTimeout(timeout)
    },
    [saveTimeout, updateMutation, isNewNote]
  )

  // Handle content change with auto-save
  const handleContentChange = useCallback(
    (newContent: string) => {
      setContent(newContent)

      if (isNewNote) {
        // Create note on first content change
        if (saveTimeout) clearTimeout(saveTimeout)
        const timeout = setTimeout(() => {
          createNoteMutation.mutate({
            title: title || 'Untitled',
            content: newContent,
            isChecklist: false,
          })
        }, 1500)
        setSaveTimeout(timeout)
        return
      }

      if (saveTimeout) clearTimeout(saveTimeout)
      const timeout = setTimeout(() => {
        updateMutation.mutate({ content: newContent })
      }, 1000)
      setSaveTimeout(timeout)
    },
    [saveTimeout, updateMutation, isNewNote, title, createNoteMutation]
  )

  // Handle add checklist item
  const handleAddItem = () => {
    if (!newItemText.trim()) {
      toast.error('Please enter item text')
      return
    }

    if (isNewNote && notebookId) {
      // Create note first for new checklist
      createNoteMutation.mutate({
        title: title || 'Untitled Checklist',
        content: '[]',
        isChecklist: true,
      })
      setAddItemModalOpen(false)
      setNewItemText('')
      return
    }

    if (noteId) {
      addItem({ noteId, text: newItemText })
      setAddItemModalOpen(false)
      setNewItemText('')
    }
  }

  // Handle add subtask
  const handleAddSubtask = async () => {
    if (!newSubtaskText.trim()) {
      toast.error('Please enter subtask text')
      return
    }

    if (!selectedParentItemId) {
      toast.error('No parent item selected')
      return
    }

    try {
      const { data: _data, error } = await supabase
        .from('checklist_subtasks' as any)
        .insert({
          item_id: selectedParentItemId,
          text: newSubtaskText.trim(),
          checked: false,
          order_index: (subtasksByItem[selectedParentItemId]?.length || 0),
        })
        .select()
        .single()

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ['checklist_subtasks_bulk'] })
      toast.success('Sub-task added!', { icon: '✅' })

      // Expand the parent item to show the new subtask
      setExpandedItems((prev) => new Set(prev).add(selectedParentItemId))

      setAddSubtaskModalOpen(false)
      setNewSubtaskText('')
      setSelectedParentItemId(null)
    } catch (error) {
      console.error('Error adding subtask:', error)
      toast.error('Failed to add sub-task')
    }
  }

  // Handle toggle subtask
  const handleToggleSubtask = async (subtaskId: string, itemId: string) => {
    const subtasks = subtasksByItem[itemId] || []
    const subtask = subtasks.find((s) => s.id === subtaskId)
    if (!subtask) return

    try {
      const { error } = await supabase
        .from('checklist_subtasks' as any)
        .update({ checked: !subtask.checked })
        .eq('id', subtaskId)

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ['checklist_subtasks_bulk'] })
    } catch (error) {
      console.error('Error toggling subtask:', error)
      toast.error('Failed to toggle sub-task')
    }
  }

  // Handle delete subtask
  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      const { error } = await supabase
        .from('checklist_subtasks' as any)
        .delete()
        .eq('id', subtaskId)

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ['checklist_subtasks_bulk'] })
      toast.success('Sub-task deleted!', { icon: '🗑️' })
    } catch (error) {
      console.error('Error deleting subtask:', error)
      toast.error('Failed to delete sub-task')
    }
  }

  // Toggle item expansion
  const toggleItemExpansion = (itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  // Calculate stats
  const wordCount = useMemo(() => {
    if (isChecklist) return 0
    const text = content.replace(/<[^>]*>/g, '').trim()
    return text ? text.split(/\s+/).length : 0
  }, [content, isChecklist])

  const charCount = useMemo(() => {
    if (isChecklist) return 0
    return content.replace(/<[^>]*>/g, '').trim().length
  }, [content, isChecklist])

  const checklistProgress = useMemo(() => {
    if (!isChecklist || checklistItems.length === 0) return 0

    // Calculate total items including subtasks
    let totalItems = 0
    let completedItems = 0

    checklistItems.forEach((item) => {
      totalItems += 1
      if (item.checked) completedItems += 1

      // Add subtasks to the count
      const subtasks = subtasksByItem[item.id] || []
      totalItems += subtasks.length
      completedItems += subtasks.filter((s) => s.checked).length
    })

    return totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100)
  }, [isChecklist, checklistItems, subtasksByItem])

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in-up max-w-4xl mx-auto">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 skeleton rounded-lg" />
          <div className="flex gap-2">
            <div className="w-10 h-10 skeleton rounded-lg" />
            <div className="w-10 h-10 skeleton rounded-lg" />
          </div>
        </div>

        {/* Badge skeleton */}
        <div className="h-8 w-24 skeleton rounded-full" />

        {/* Title skeleton */}
        <div className="h-10 w-96 skeleton rounded" />

        {/* Content skeleton */}
        <div className="card p-6 space-y-3">
          <div className="h-4 w-full skeleton rounded" />
          <div className="h-4 w-5/6 skeleton rounded" />
          <div className="h-4 w-4/6 skeleton rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up max-w-4xl mx-auto">
      {/* Enhanced Header */}
      <div className="card-gradient overflow-hidden">
        <div
          className={`h-2 w-full ${
            isChecklist
              ? 'bg-gradient-to-r from-success-500 to-success-600'
              : 'bg-gradient-to-r from-primary-500 to-primary-600'
          }`}
        />
        <div className="p-4">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              title="Go back"
            >
              <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
            </button>

            {/* Center: Auto-save indicator */}
            <div className="flex items-center gap-2 text-sm">
              {isSaving ? (
                <div className="flex items-center gap-2 text-gray-600">
                  <CloudIcon className="w-5 h-5 animate-pulse" />
                  <span>Saving...</span>
                </div>
              ) : lastSaved ? (
                <div className="flex items-center gap-2 text-success-600">
                  <CheckIcon className="w-5 h-5" />
                  <span>Saved {lastSaved.toLocaleTimeString()}</span>
                </div>
              ) : null}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {!isNewNote && (
                <button
                  onClick={() => pinMutation.mutate()}
                  disabled={pinMutation.isPending}
                  className={`p-2.5 rounded-xl transition-all duration-200 hover:scale-110 ${
                    note?.is_pinned
                      ? 'bg-secondary-100 text-secondary-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={note?.is_pinned ? 'Unpin note' : 'Pin note'}
                >
                  📌
                </button>
              )}

              {!isNewNote && (
                <button
                  onClick={() => setDeleteConfirmOpen(true)}
                  disabled={deleteMutation.isPending}
                  className="p-2.5 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all duration-200 hover:scale-110"
                  title="Delete note"
                >
                  <TrashIcon className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        {/* Note Type */}
        <div className="card-hover p-3 group">
          <div className="flex items-center gap-2">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ${
                isChecklist
                  ? 'bg-gradient-to-br from-success-500 to-success-600'
                  : 'bg-gradient-to-br from-primary-500 to-primary-600'
              }`}
            >
              {isChecklist ? (
                <CheckCircleIcon className="w-5 h-5 text-white" />
              ) : (
                <DocumentTextIcon className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <p className="text-xs text-gray-600">Type</p>
              <p className="text-sm font-semibold text-gray-900">
                {isChecklist ? 'Checklist' : 'Note'}
              </p>
            </div>
          </div>
        </div>

        {/* Words/Progress */}
        {isChecklist ? (
          <div className="card-hover p-3 group">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary-500 to-secondary-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-sm">
                  {checklistProgress}%
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-600">Progress</p>
                <p className="text-sm font-semibold text-gray-900">
                  {(() => {
                    let total = checklistItems.length
                    let completed = checklistItems.filter((i) => i.checked).length
                    Object.values(subtasksByItem).forEach((subtasks) => {
                      total += subtasks.length
                      completed += subtasks.filter((s) => s.checked).length
                    })
                    return `${completed}/${total}`
                  })()}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="card-hover p-3 group">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary-500 to-secondary-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-xs">{wordCount}</span>
              </div>
              <div>
                <p className="text-xs text-gray-600">Words</p>
                <p className="text-sm font-semibold text-gray-900">{charCount} chars</p>
              </div>
            </div>
          </div>
        )}

        {/* Items/Last Saved */}
        <div className="card-hover p-3 group">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              {isChecklist ? (
                <span className="text-white font-bold text-xs">
                  {checklistItems.length}
                </span>
              ) : (
                <CloudIcon className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <p className="text-xs text-gray-600">
                {isChecklist ? 'Items' : 'Status'}
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {isChecklist
                  ? checklistItems.length
                  : isSaving
                  ? 'Saving...'
                  : 'Saved'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Title Input */}
      <input
        type="text"
        placeholder={isChecklist ? 'Checklist title...' : 'Note title...'}
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
        className="text-4xl font-bold text-gray-900 bg-transparent border-none outline-none w-full placeholder-gray-400 focus:placeholder-gray-300 transition-colors px-1"
        maxLength={200}
      />

      {/* Content Area */}
      {!isChecklist ? (
        // Rich Text Editor for Notes
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
                [{ color: [] }, { background: [] }],
                ['link'],
                ['clean'],
              ],
            }}
            placeholder="Start typing your note..."
            className="h-96"
          />
        </div>
      ) : (
        // Checklist Items
        <div className="card p-6 space-y-4">
          {checklistItems.length === 0 ? (
            // Empty state
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-success-100 to-success-200 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="w-8 h-8 text-success-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No items yet
              </h3>
              <p className="text-gray-600 mb-6">Add your first checklist item to get started</p>
              <button onClick={() => setAddItemModalOpen(true)} className="btn-primary">
                <PlusIcon className="w-5 h-5" />
                Add Item
              </button>
            </div>
          ) : (
            // Checklist items
            <>
              <div className="space-y-1">
                {checklistItems.map((item) => {
                  const itemSubtasks = subtasksByItem[item.id] || []
                  const hasSubtasks = itemSubtasks.length > 0
                  const isExpanded = expandedItems.has(item.id)

                  return (
                    <div key={item.id} className="space-y-1">
                      {/* Main Item */}
                      <div className="group flex items-start gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        {/* Expand/Collapse Button */}
                        {hasSubtasks ? (
                          <button
                            onClick={() => toggleItemExpansion(item.id)}
                            className="flex-shrink-0 w-5 h-5 mt-0.5 text-gray-400 hover:text-gray-600 transition-colors"
                            title={isExpanded ? 'Collapse' : 'Expand'}
                          >
                            {isExpanded ? (
                              <ChevronDownIcon className="w-5 h-5" />
                            ) : (
                              <ChevronRightIcon className="w-5 h-5" />
                            )}
                          </button>
                        ) : (
                          <div className="w-5 h-5" />
                        )}

                        {/* Checkbox */}
                        <button
                          onClick={() => toggleItem(item.id)}
                          className={`flex-shrink-0 w-6 h-6 mt-0.5 rounded border-2 transition-all duration-200 ${
                            item.checked
                              ? 'bg-success-500 border-success-500 scale-110'
                              : 'border-gray-300 hover:border-success-500 hover:scale-110'
                          }`}
                        >
                          {item.checked && (
                            <svg
                              className="w-4 h-4 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </button>

                        {/* Item Text */}
                        <span
                          className={`flex-1 text-lg transition-all ${
                            item.checked ? 'line-through text-gray-400' : 'text-gray-900'
                          }`}
                        >
                          {item.text}
                          {hasSubtasks && (
                            <span className="ml-2 text-xs text-gray-500 font-medium">
                              ({itemSubtasks.filter((s) => s.checked).length}/
                              {itemSubtasks.length})
                            </span>
                          )}
                        </span>

                        {/* Action Buttons (show on hover) */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setSelectedParentItemId(item.id)
                              setAddSubtaskModalOpen(true)
                            }}
                            className="p-1.5 text-gray-400 hover:text-success-600 hover:bg-success-50 rounded-lg transition-all"
                            title="Add sub-task"
                          >
                            <PlusIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete item"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Subtasks (indented) */}
                      {hasSubtasks && isExpanded && (
                        <div className="ml-12 space-y-1">
                          {itemSubtasks.map((subtask) => (
                            <div
                              key={subtask.id}
                              className="group flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              {/* Subtask Checkbox */}
                              <button
                                onClick={() => handleToggleSubtask(subtask.id, item.id)}
                                className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded border-2 transition-all duration-200 ${
                                  subtask.checked
                                    ? 'bg-success-500 border-success-500 scale-110'
                                    : 'border-gray-300 hover:border-success-500 hover:scale-110'
                                }`}
                              >
                                {subtask.checked && (
                                  <svg
                                    className="w-3 h-3 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                              </button>

                              {/* Subtask Text */}
                              <span
                                className={`flex-1 text-base transition-all ${
                                  subtask.checked
                                    ? 'line-through text-gray-400'
                                    : 'text-gray-700'
                                }`}
                              >
                                {subtask.text}
                              </span>

                              {/* Delete Subtask Button */}
                              <button
                                onClick={() => handleDeleteSubtask(subtask.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Delete sub-task"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Add Item Button */}
              <button
                onClick={() => setAddItemModalOpen(true)}
                className="w-full py-3 text-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all border-2 border-dashed border-gray-300 hover:border-gray-400 flex items-center justify-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Add item</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Footer Metadata */}
      {!isNewNote && note && (
        <div className="card p-4 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <span>📅 Created {new Date(note.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>
              🕐 Last edited {new Date(note.updated_at).toLocaleDateString()} at{' '}
              {new Date(note.updated_at).toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {addItemModalOpen && (
        <>
          <div
            className="modal-overlay"
            onClick={() => {
              setAddItemModalOpen(false)
              setNewItemText('')
            }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="modal-content w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <CheckCircleIcon className="w-6 h-6 text-success-600" />
                  Add Checklist Item
                </h3>
                <button
                  onClick={() => {
                    setAddItemModalOpen(false)
                    setNewItemText('')
                  }}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Text
                  </label>
                  <textarea
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    placeholder="Enter item text..."
                    className="input resize-none h-24"
                    maxLength={500}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        handleAddItem()
                      }
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {newItemText.length}/500 characters
                  </p>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setAddItemModalOpen(false)
                      setNewItemText('')
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddItem}
                    disabled={!newItemText.trim() || isAdding}
                    className="btn-primary"
                  >
                    {isAdding ? (
                      <>
                        <div className="spinner" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <PlusIcon className="w-5 h-5" />
                        Add Item
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Subtask Modal */}
      {addSubtaskModalOpen && (
        <>
          <div
            className="modal-overlay"
            onClick={() => {
              setAddSubtaskModalOpen(false)
              setNewSubtaskText('')
              setSelectedParentItemId(null)
            }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="modal-content w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <PlusIcon className="w-6 h-6 text-success-600" />
                  Add Sub-task
                </h3>
                <button
                  onClick={() => {
                    setAddSubtaskModalOpen(false)
                    setNewSubtaskText('')
                    setSelectedParentItemId(null)
                  }}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sub-task Text
                  </label>
                  <textarea
                    value={newSubtaskText}
                    onChange={(e) => setNewSubtaskText(e.target.value)}
                    placeholder="Enter sub-task text..."
                    className="input resize-none h-24"
                    maxLength={500}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        handleAddSubtask()
                      }
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {newSubtaskText.length}/500 characters
                  </p>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setAddSubtaskModalOpen(false)
                      setNewSubtaskText('')
                      setSelectedParentItemId(null)
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddSubtask}
                    disabled={!newSubtaskText.trim()}
                    className="btn-primary"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Add Sub-task
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      {!isNewNote && (
        <ConfirmDialog
          isOpen={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          onConfirm={() => deleteMutation.mutate()}
          title="Delete Note"
          message={`Are you sure you want to delete "${
            title || 'this note'
          }"? This action cannot be undone.`}
          confirmText="Delete"
          confirmVariant="danger"
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  )
}
