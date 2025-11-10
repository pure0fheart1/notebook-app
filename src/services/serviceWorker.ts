// Service Worker registration and management

export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      })

      console.log('Service Worker registered successfully:', registration)

      // Check for updates periodically
      setInterval(() => {
        registration.update()
      }, 60000) // Check every minute

      return registration
    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  }
}

export async function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready
      await registration.unregister()
      console.log('Service Worker unregistered')
    } catch (error) {
      console.error('Service Worker unregistration failed:', error)
    }
  }
}

// Check if the app is online
export function isOnline(): boolean {
  return navigator.onLine
}

// Listen for online/offline events
export function setupNetworkListeners(
  onOnline?: () => void,
  onOffline?: () => void
) {
  window.addEventListener('online', () => {
    console.log('App is online')
    onOnline?.()
  })

  window.addEventListener('offline', () => {
    console.log('App is offline')
    onOffline?.()
  })
}