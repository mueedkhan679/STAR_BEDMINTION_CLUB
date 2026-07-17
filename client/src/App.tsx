import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Players from './pages/Players'
import Payments from './pages/Payments'
import Investments from './pages/Investments'
import Shuttle from './pages/Shuttle'
import Records from './pages/Records'
import Sidebar from './components/Sidebar'
import VoiceAssistant from './components/VoiceAssistant'

interface User {
  id: string
  username: string
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [players, setPlayers] = useState<Array<{ id: string; name: string; player_code: string }>>([])
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    console.log('🚀 App component mounted')
    const userData = localStorage.getItem('user')
    const darkModePreference = localStorage.getItem('darkMode')

    if (userData) {
      console.log('✅ Found user in localStorage')
      setIsAuthenticated(true)
      setUser(JSON.parse(userData))
    } else {
      console.log('ℹ️ No user in localStorage, showing login')
    }

    // Load dark mode preference
    if (darkModePreference) {
      setDarkMode(darkModePreference === 'true')
    }

    setLoading(false)
  }, [])

  // Fetch players for voice assistant
  useEffect(() => {
    if (isAuthenticated) {
      fetchPlayers()
    }
  }, [isAuthenticated])

  const fetchPlayers = async () => {
    try {
      const { supabase } = await import('./lib/supabase')
      const { data } = await supabase
        .from('players')
        .select('id, name, player_code')
        .order('name')
      
      if (data) {
        setPlayers(data)
      }
    } catch (error) {
      console.error('Failed to fetch players:', error)
    }
  }

  const handleLogin = (user: any) => {
    console.log('🔐 Login successful')
    localStorage.setItem('user', JSON.stringify(user))
    setIsAuthenticated(true)
    setUser(user)
  }

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', String(newDarkMode))
  }

  const handleLogout = async () => {
    console.log('🚪 Logout')
    try {
      const { supabase } = await import('./lib/supabase')
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Logout error:', error)
    }
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUser(null)
  }

  const handleAddPayment = async (playerId: string, amount: number) => {
    try {
      const { supabase } = await import('./lib/supabase')
      const now = new Date()
      const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })

      // Get installment number
      const { data: existingPayments } = await supabase
        .from('payments')
        .select('id')
        .eq('player_id', playerId)

      const installmentNumber = (existingPayments?.length || 0) + 1

      const { error } = await supabase
        .from('payments')
        .insert([{
          player_id: playerId,
          amount: amount,
          date: now.toISOString(),
          time: timeString,
          installment_number: installmentNumber
        }])

      if (error) throw error
      
      // Refresh players list
      await fetchPlayers()
      
      return Promise.resolve()
    } catch (error) {
      console.error('Failed to add payment:', error)
      return Promise.reject(error)
    }
  }

  const handleDeletePayment = async (paymentId: string) => {
    try {
      const { supabase } = await import('./lib/supabase')
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', paymentId)

      if (error) throw error
      
      return Promise.resolve()
    } catch (error) {
      console.error('Failed to delete payment:', error)
      return Promise.reject(error)
    }
  }

  const handleDeletePlayer = async (playerId: string) => {
    try {
      const { supabase } = await import('./lib/supabase')
      
      // Delete all payments for this player first
      await supabase
        .from('payments')
        .delete()
        .eq('player_id', playerId)
      
      // Delete the player
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId)

      if (error) throw error
      
      // Refresh players list
      await fetchPlayers()
      
      toast.success('Player deleted successfully')
      return Promise.resolve()
    } catch (error) {
      console.error('Failed to delete player:', error)
      toast.error('Failed to delete player')
      return Promise.reject(error)
    }
  }

  const handleDeleteInstallment = async (playerId: string, installmentNumber?: number | string) => {
    try {
      const { supabase } = await import('./lib/supabase')
      
      if (installmentNumber === 'all') {
        // Delete all installments for this player
        const { error } = await supabase
          .from('payments')
          .delete()
          .eq('player_id', playerId)

        if (error) throw error
        toast.success('All installments deleted successfully')
      } else if (installmentNumber) {
        // Delete specific installment
        const { data: payments } = await supabase
          .from('payments')
          .select('id, installment_number')
          .eq('player_id', playerId)
          .order('installment_number')

        if (!payments || payments.length === 0) {
          throw new Error('No installments found')
        }

        // Find the payment with the matching installment number
        const paymentToDelete = payments.find(p => p.installment_number === installmentNumber)
        
        if (!paymentToDelete) {
          throw new Error(`Installment ${installmentNumber} not found`)
        }

        const { error } = await supabase
          .from('payments')
          .delete()
          .eq('id', paymentToDelete.id)

        if (error) throw error
        toast.success(`Installment ${installmentNumber} deleted successfully`)
      }
      
      return Promise.resolve()
    } catch (error) {
      console.error('Failed to delete installment:', error)
      toast.error('Failed to delete installment')
      return Promise.reject(error)
    }
  }

  const handleAddPlayer = async (playerData: { name: string; father_name: string; address: string; email: string }) => {
    try {
      const { supabase } = await import('./lib/supabase')
      
      const { data, error } = await supabase
        .from('players')
        .insert([{
          ...playerData,
          player_code: 'SB' + String(Date.now()).slice(-3)
        }])
        .select()
        .single()

      if (error) {
        console.error('Insert error:', error)
        throw error
      }

      toast.success('Player added successfully')
      await fetchPlayers()
      
      return Promise.resolve()
    } catch (error: any) {
      console.error('Full error:', error)
      toast.error(error.message || 'Failed to add player')
      return Promise.reject(error)
    }
  }

  const handleNavigate = (page: string) => {
    console.log('🧭 Navigating to:', page)
    // Navigation is handled by React Router, this is just for logging
    // The actual navigation will happen via window.location or React Router's navigate function
    window.location.hash = `#/${page}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-white text-2xl font-bold">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    console.log('🔑 Showing login page')
    return <Login onLogin={handleLogin} />
  }

  console.log('🏠 Showing main app')
  return (
    <div className={`flex h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Sidebar onLogout={handleLogout} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className="flex-1 overflow-auto w-full">
        <div className="pt-14 lg:pt-0"> {/* Add padding top on mobile for menu button */}
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/players" element={<Players />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/investments" element={<Investments />} />
            <Route path="/shuttle" element={<Shuttle />} />
            <Route path="/records" element={<Records />} />
          </Routes>
        </div>
      </div>
      
      {/* Voice Assistant */}
      <VoiceAssistant
        onAddPayment={handleAddPayment}
        onDeletePayment={handleDeletePayment}
        onDeletePlayer={handleDeletePlayer}
        onDeleteInstallment={handleDeleteInstallment}
        onAddPlayer={handleAddPlayer}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        players={players}
      />
    </div>
  )
}

export default App
