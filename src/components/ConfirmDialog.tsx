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
        <div className="modal-content w-full max-w-md p-6 relative">
          {/* Glow effect */}
          <div className={`absolute inset-0 rounded-2xl blur-2xl opacity-20 ${
            confirmVariant === 'danger' ? 'bg-red-500' : 'bg-purple-500'
          }`} />

          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3 flex-1">
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-xl ${
                  confirmVariant === 'danger'
                    ? 'bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30'
                    : 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30'
                }`}>
                  <ExclamationTriangleIcon
                    className={`w-6 h-6 ${
                      confirmVariant === 'danger' ? 'text-red-400' : 'text-purple-400'
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {message}
                  </p>
                </div>
              </div>
              {!isLoading && (
                <button
                  onClick={onClose}
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-all"
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
      </div>
    </>
  )
}
