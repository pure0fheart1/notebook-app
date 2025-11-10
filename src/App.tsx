import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import { useAuth } from '@/hooks/useAuth'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// Pages
import Login from '@/pages/Login'
import SignUp from '@/pages/SignUp'
import Dashboard from '@/pages/Dashboard'
import NotebookView from '@/pages/NotebookView'
import NoteEditor from '@/pages/NoteEditor'

// Components
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'

// Network Status Banner
function NetworkStatusBanner() {
  const { isOnline } = useNetworkStatus()

  if (isOnline) return null

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white px-4 py-2 text-center z-50 shadow-lg">
      <span className="font-medium">⚠️ You're offline.</span> Some features may not work properly.
    </div>
  )
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="text-center">
          <div className="spinner-lg text-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/dashboard" />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/notebook/:id" element={<NotebookView />} />
          <Route path="/note/:id" element={<NoteEditor />} />
        </Route>
      </Route>

      {/* Default route */}
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
    </Routes>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <NetworkStatusBanner />
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
                borderRadius: '12px',
                padding: '16px',
              },
              success: {
                style: {
                  background: '#10b981',
                },
                iconTheme: {
                  primary: '#fff',
                  secondary: '#10b981',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                },
                iconTheme: {
                  primary: '#fff',
                  secondary: '#ef4444',
                },
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App