import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useState, useEffect } from 'react'
import SearchModal from './SearchModal'
import { useRealtimeNotebooks } from '@/hooks/useRealtime'
import {
  BookOpenIcon,
  HomeIcon,
  PlusIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'

export default function Layout() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  // Enable realtime sync
  useRealtimeNotebooks()

  // Handle keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Notebooks', href: '/dashboard', icon: BookOpenIcon },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen relative">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Glassmorphism */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full glass-strong backdrop-blur-2xl border-r border-white/10">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
            <Link to="/dashboard" className="flex items-center space-x-2 group">
              <div className="relative">
                <BookOpenIcon className="w-8 h-8 text-purple-400 transition-transform group-hover:scale-110" />
                <div className="absolute inset-0 blur-lg bg-purple-400/30 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                NoteBook
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-gray-300" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group ${
                    active
                      ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30 shadow-lg shadow-purple-500/20'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white hover:border-white/10 border border-transparent'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 transition-transform group-hover:scale-110 ${
                    active ? 'text-purple-400' : ''
                  }`} />
                  {item.name}
                </Link>
              )
            })}

            <button className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-300 rounded-xl hover:bg-white/10 hover:text-white transition-all duration-200 group border border-transparent hover:border-white/10">
              <PlusIcon className="w-5 h-5 mr-3 transition-transform group-hover:rotate-90" />
              New Notebook
            </button>
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 p-3 rounded-xl glass hover:bg-white/10 transition-all duration-200 group">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg shadow-purple-500/30">
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
              <button
                onClick={signOut}
                className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all"
                title="Sign out"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 relative z-10">
        {/* Top bar - Glassmorphism */}
        <header className="glass-strong backdrop-blur-2xl border-b border-white/10 sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Bars3Icon className="w-6 h-6 text-gray-300" />
            </button>

            {/* Search bar */}
            <div className="flex-1 max-w-2xl mx-4">
              <button
                onClick={() => setSearchOpen(true)}
                className="w-full flex items-center justify-between px-4 py-2 rounded-xl glass hover:bg-white/10 transition-all text-left group border border-white/10 hover:border-purple-400/30"
              >
                <span className="flex items-center text-gray-400 group-hover:text-gray-300">
                  <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                  Search notes...
                </span>
                <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-semibold bg-white/10 border border-white/10 rounded-lg text-gray-400">
                  ⌘K
                </kbd>
              </button>
            </div>

            {/* Quick actions */}
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-purple-400 rounded-lg hover:bg-white/10 transition-all group">
                <PlusIcon className="w-5 h-5 transition-transform group-hover:rotate-90" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 relative">
          <Outlet />
        </main>
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}