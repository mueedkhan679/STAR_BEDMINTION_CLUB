import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { calculateShuttleStock } from '../lib/stockUtils'
import { motion } from 'framer-motion'
import {
  DollarSign,
  Wallet,
  TrendingUp,
  Package,
  PackageOpen,
  Users,
  ShoppingCart
} from 'lucide-react'

interface DashboardStats {
  totalPayments: number
  currentBalance: number
  totalInvestment: number
  totalShuttlesPurchased: number
  totalShuttlesUsed: number
  remainingShuttleStock: number
  totalPlayers: number
}

function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPayments: 0,
    currentBalance: 0,
    totalInvestment: 0,
    totalShuttlesPurchased: 0,
    totalShuttlesUsed: 0,
    remainingShuttleStock: 0,
    totalPlayers: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [paymentsRes, playersRes] = await Promise.all([
        supabase.from('payments').select('amount'),
        supabase.from('players').select('*', { count: 'exact', head: true })
      ])

      const payments = paymentsRes.data || []
      const playersCount = playersRes.count || 0

      const totalPayments = payments.reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0)

      // Get investments for total investment calculation
      const { data: investments } = await supabase
        .from('investments')
        .select('amount')

      const totalInvestment = investments?.reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0) || 0

      // Use shared utility for shuttle stock calculation
      const stockData = await calculateShuttleStock()

      console.log('Dashboard stats:', {
        totalPayments,
        totalInvestment,
        totalShuttlesPurchased: stockData.totalPurchased,
        totalShuttlesUsed: stockData.totalUsed,
        remainingShuttleStock: stockData.remaining
      })

      setStats({
        totalPayments,
        currentBalance: totalPayments - totalInvestment,
        totalInvestment,
        totalShuttlesPurchased: stockData.totalPurchased,
        totalShuttlesUsed: stockData.totalUsed,
        remainingShuttleStock: stockData.remaining,
        totalPlayers: playersCount
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Received Payments',
      value: `Rs. ${stats.totalPayments.toFixed(2)}`,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      title: 'Current Balance',
      value: `Rs. ${stats.currentBalance.toFixed(2)}`,
      icon: Wallet,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'Total Investment',
      value: `Rs. ${stats.totalInvestment.toFixed(2)}`,
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      title: 'Total Shuttles Purchased',
      value: stats.totalShuttlesPurchased.toString(),
      icon: ShoppingCart,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      title: 'Total Shuttles Used',
      value: stats.totalShuttlesUsed.toString(),
      icon: PackageOpen,
      color: 'from-red-500 to-pink-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    },
    {
      title: 'Remaining Shuttle Stock',
      value: stats.remainingShuttleStock.toString(),
      icon: Package,
      color: 'from-teal-500 to-green-600',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20'
    },
    {
      title: 'Total Players',
      value: stats.totalPlayers.toString(),
      icon: Users,
      color: 'from-indigo-500 to-purple-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome to Star Badminton Club Management System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${card.bgColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`bg-gradient-to-r ${card.color} p-3 rounded-xl`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
              {card.title}
            </h3>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {card.value}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard