import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  TrendingUp,
  Package,
  FileText,
  LogOut,
  Menu,
  X,
  Moon,
  Sun
} from 'lucide-react'
import { useState } from 'react'

interface SidebarProps {
  onLogout: () => void
  darkMode: boolean
  toggleDarkMode: () => void
}

function Sidebar({ onLogout, darkMode, toggleDarkMode }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/players', icon: Users, label: 'Players' },
    { path: '/payments', icon: CreditCard, label: 'Payments' },
    { path: '/investments', icon: TrendingUp, label: 'Expenses & Investments' },
    { path: '/shuttle', icon: Package, label: 'Shuttle Usage' },
    { path: '/records', icon: FileText, label: 'Records' },
  ]

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar - Always visible on desktop, toggleable on mobile */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 shadow-xl lg:static lg:block`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">Star Badminton</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">Club Management</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="mt-4 w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span className="font-medium">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <button
            onClick={onLogout}
            className="mt-2 w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>

          {/* Footer Credit */}
          <div className="mt-auto pt-8 pb-4">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Software made by
            </p>
            <p className="text-sm text-center font-semibold text-gray-700 dark:text-gray-300">
              Abdul Mueed Khan
            </p>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
        />
      )}
    </>
  )
}

export default Sidebar