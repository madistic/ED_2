import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  Menu, 
  X, 
  Home, 
  CreditCard, 
  Building2, 
  Search, 
  LogOut, 
  User,
  Moon,
  Sun
} from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'All Transactions', href: '/transactions', icon: CreditCard },
    { name: 'By School', href: '/transactions/school', icon: Building2 },
    { name: 'Status Check', href: '/check-status', icon: Search },
  ]

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${darkMode ? 'dark' : ''}`}>
      <div className="flex">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 transform 
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 lg:static lg:inset-0 transition-transform duration-300 ease-in-out
          border-r border-gray-200 dark:border-gray-700
        `}>
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Payment Dashboard
            </h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="mt-8">
            <div className="px-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                      }
                    `}
                  >
                    <Icon size={18} className="mr-3" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.username}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </p>
                </div>
              </div>
              
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>

            <button
              onClick={logout}
              className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 lg:ml-0">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  <Menu size={20} />
                </button>

                <div className="flex-1 lg:ml-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
                  </h2>
                </div>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="p-4 sm:p-6 lg:p-8">
            <div className="animate-fade-in">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default Layout