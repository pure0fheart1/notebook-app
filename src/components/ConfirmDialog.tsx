import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  confirmVariant?: 'danger' | 'primary'
  isLoading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  confirmVariant = 'danger',
  isLoading = false,
}: Props) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-overlay"
        onClick={isLoading ? undefined : onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="modal-content w-full max-w-md p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3 flex-1">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                confirmVariant === 'danger' ? 'bg-red-100' : 'bg-primary-100'
              }`}>
                <ExclamationTriangleIcon
                  className={`w-6 h-6 ${
                    confirmVariant === 'danger' ? 'text-red-600' : 'text-primary-600'
                  }`}
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {title}
                </h3>
                <p className="text-sm text-gray-600">
                  {message}
                </p>
              </div>
            </div>
            {!isLoading && (
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              className="flex-1 btn-secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`flex-1 ${
                confirmVariant === 'danger' ? 'btn-danger' : 'btn-primary'
              }`}
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner" />
                  Processing...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
