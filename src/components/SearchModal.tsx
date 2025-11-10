import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSearch } from '@/hooks/useSearch'
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const navigate = useNavigate()
  const { query, setQuery, results } = useSearch()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const handleResultClick = (result: any) => {
    if (result.type === 'notebook') {
      navigate(`/notebook/${result.id}`)
    } else {
      navigate(`/note/${result.id}`)
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            {/* Search input */}
            <div className="relative p-4 border-b border-gray-200">
              <MagnifyingGlassIcon className="absolute left-7 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search notes, notebooks..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={onClose}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {query.trim() === '' ? (
                <div className="p-8 text-center text-gray-500">
                  <p>Start typing to search your notes and notebooks</p>
                </div>
              ) : results.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No results found for "{query}"</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {results.map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {result.title}
                          </h3>
                          {result.type === 'note' && result.notebookTitle && (
                            <p className="text-sm text-gray-500 mt-1">
                              in <span className="font-medium">{result.notebookTitle}</span>
                            </p>
                          )}
                          {result.content && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                              {result.content.replace(/<[^>]*>/g, '')}
                            </p>
                          )}
                        </div>
                        <span className="ml-2 px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded whitespace-nowrap">
                          {result.type === 'notebook' ? '📚 Notebook' : '📝 Note'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer hint */}
            {query.trim() !== '' && (
              <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 border-t border-gray-200">
                Press <kbd className="px-2 py-1 bg-white border border-gray-300 rounded">ESC</kbd> to close
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}