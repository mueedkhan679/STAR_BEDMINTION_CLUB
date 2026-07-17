import { useState } from 'react'
import { supabase, Admin } from '../lib/supabase'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Trophy, User, Eye, EyeOff } from 'lucide-react'

interface LoginProps {
  onLogin: (user: Admin) => void
}

function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log('🔐 Attempting login with username:', username)
      
      // Fetch admin from Supabase
      const { data, error } = await supabase
        .from('admin')
        .select('*')
        .eq('username', username)
        .single()

      console.log('📊 Supabase response:', { data, error })

      if (error) {
        console.error('❌ Supabase error:', error)
        toast.error('Invalid credentials')
        return
      }

      if (!data) {
        console.error('❌ No data returned')
        toast.error('Invalid credentials')
        return
      }

      console.log('✅ Found admin:', data.username)

      // Check password
      const admin = data as Admin
      if (admin.password === password) {
        // Store user in localStorage
        localStorage.setItem('user', JSON.stringify(admin))
        toast.success('Login successful!')
        onLogin(admin)
      } else {
        toast.error('Invalid credentials')
      }
    } catch (error) {
      console.error('❌ Login error:', error)
      toast.error('Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-gray-300 via-gray-200 to-gray-400 rounded-3xl shadow-2xl p-8 w-full max-w-md border-4 border-gray-400"
        style={{
          boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.3)'
        }}
      >
        {/* Trophy Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-4 rounded-full shadow-lg">
            <Trophy className="w-16 h-16 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Star Badminton Club
        </h1>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="h-6 w-6 text-gray-600" />
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-200 bg-opacity-50 border-2 border-gray-400 rounded-full text-gray-800 placeholder-gray-600 focus:outline-none focus:border-gray-600 focus:bg-white transition-all"
              placeholder="Username"
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              {showPassword ? (
                <EyeOff className="h-6 w-6 text-gray-600" />
              ) : (
                <Eye className="h-6 w-6 text-gray-600" />
              )}
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-gray-200 bg-opacity-50 border-2 border-gray-400 rounded-full text-gray-800 placeholder-gray-600 focus:outline-none focus:border-gray-600 focus:bg-white transition-all"
              placeholder="Password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-6 w-6 text-gray-600 hover:text-gray-800" />
              ) : (
                <Eye className="h-6 w-6 text-gray-600 hover:text-gray-800" />
              )}
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-4 rounded-full font-bold text-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            style={{
              boxShadow: '0 4px 15px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.2)'
            }}
          >
            {loading ? 'LOGGING IN...' : 'LOGIN'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-700 mb-2">Software made by Abdul Mueed Khan</p>
        </div>
      </motion.div>
    </div>
  )
}

export default Login