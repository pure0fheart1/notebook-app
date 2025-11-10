export interface ErrorContext {
  user?: { id: string; email?: string }
  component?: string
  action?: string
  metadata?: Record<string, any>
}

export function logError(
  error: Error | unknown,
  context?: ErrorContext
) {
  const errorDetails = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
    ...context,
    userAgent: navigator.userAgent,
    url: window.location.href,
  }

  // Log to console in development
  if (import.meta.env.DEV) {
    console.error('Error logged:', errorDetails)
  }

  // Send to error tracking service in production
  if (import.meta.env.PROD) {
    // Sentry, LogRocket, etc.
    // Sentry.captureException(error, { contexts: { custom: errorDetails } })
  }

  return errorDetails
}

export function getUserFriendlyMessage(error: Error | unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('violates row-level security') || error.message.includes('RLS')) {
      return "You don't have permission to perform this action"
    }
    if (error.message.includes('duplicate key')) {
      return 'This item already exists'
    }
    if (error.message.includes('network') || error.message.includes('fetch') || error.message.includes('NetworkError')) {
      return 'Network error. Please check your connection'
    }
    if (error.message.includes('not found') || error.message.includes('404')) {
      return 'The requested item was not found'
    }
    if (error.message.includes('JWT') || error.message.includes('authentication') || error.message.includes('Unauthorized')) {
      return 'Your session has expired. Please log in again'
    }
  }

  return 'An unexpected error occurred. Please try again'
}
