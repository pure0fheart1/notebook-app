export interface ErrorContext {
  user?: { id: string; email?: string }
  component?: string
  action?: string
  metadata?: Record<string, any>
  [key: string]: any // Allow additional properties
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
    // PostgREST schema cache errors
    if (error.message.includes('PGRST205') || error.message.includes('schema cache')) {
      return 'Database tables not accessible. Please contact support or check the database setup.'
    }
    if (error.message.includes('PGRST204') || error.message.includes('no relationship')) {
      return 'Database relationship error. Please contact support.'
    }

    // Row Level Security errors
    if (error.message.includes('violates row-level security') || error.message.includes('RLS')) {
      return "You don't have permission to perform this action"
    }

    // Duplicate key errors
    if (error.message.includes('duplicate key')) {
      return 'This item already exists'
    }

    // Network errors
    if (error.message.includes('network') || error.message.includes('fetch') || error.message.includes('NetworkError')) {
      return 'Network error. Please check your connection'
    }

    // Not found errors
    if (error.message.includes('not found') || error.message.includes('404')) {
      return 'The requested item was not found'
    }

    // Authentication errors
    if (error.message.includes('JWT') || error.message.includes('authentication') || error.message.includes('Unauthorized')) {
      return 'Your session has expired. Please log in again'
    }

    // Foreign key constraint errors
    if (error.message.includes('foreign key constraint') || error.message.includes('violates foreign key')) {
      return 'Cannot complete operation due to related data. Please try again.'
    }
  }

  return 'An unexpected error occurred. Please try again'
}
