import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './styles/index.css'
import { registerServiceWorker, setupNetworkListeners } from './services/serviceWorker'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
})

// Register Service Worker for PWA support
registerServiceWorker()

// Setup network status listeners
setupNetworkListeners(
  () => {
    console.log('Connection restored')
    // Could trigger a sync here
  },
  () => {
    console.log('Connection lost - app will work offline')
  }
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)