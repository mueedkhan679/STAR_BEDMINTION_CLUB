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
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    {
      title: 'Current Balance',
      value: `Rs. ${stats.currentBalance.toFixed(2)}`,
      icon: Wallet,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    {
      title: 'Total Investment',
      value: `Rs. ${stats.totalInvestment.toFixed(2)}`,
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800'
    },
    {
      title: 'Total Shuttles Purchased',
      value: stats.totalShuttlesPurchased.toString(),
      icon: ShoppingCart,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800'
    },
    {
      title: 'Total Shuttles Used',
      value: stats.totalShuttlesUsed.toString(),
      icon: PackageOpen,
      color: 'from-red-500 to-pink-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800'
    },
    {
      title: 'Remaining Shuttle Stock',
      value: stats.remainingShuttleStock.toString(),
      icon: Package,
      color: 'from-teal-500 to-green-600',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20',
      borderColor: 'border-teal-200 dark:border-teal-800'
    },
    {
      title: 'Total Players',
      value: stats.totalPlayers.toString(),
      icon: Users,
      color: 'from-indigo-500 to-purple-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      borderColor: 'border-indigo-200 dark:border-indigo-800'
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
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-1 sm:mb-2">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Welcome to Star Badminton Club Management System</p>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              delay: index * 0.1,
              type: "spring",
              stiffness: 100,
              damping: 12
            }}
            whileHover={{ 
              scale: 1.05,
              y: -5,
              transition: { duration: 0.2 }
            }}
            className={`${card.bgColor} ${card.borderColor} border-2 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-md sm:shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer relative overflow-hidden`}
          >
            {/* Animated background gradient on hover */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-r ${card.color} opacity-0`}
              whileHover={{ opacity: 0.1 }}
              transition={{ duration: 0.3 }}
            />

            {/* Icon with pulse animation */}
            <motion.div
              className="flex items-center justify-between mb-2 sm:mb-4 relative z-10"
              whileHover={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <div className={`bg-gradient-to-r ${card.color} p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-lg`}>
                <card.icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
            </motion.div>

            {/* Title with fade-in animation */}
            <motion.h3 
              className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 sm:mb-2 leading-tight relative z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.2 }}
            >
              {card.title}
            </motion.h3>

            {/* Value with count-up animation effect */}
            <motion.p 
              className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-white break-words relative z-10"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                delay: index * 0.1 + 0.3,
                type: "spring",
                stiffness: 200,
                damping: 10
              }}
            >
              {card.value}
            </motion.p>

            {/* Shimmer effect on hover */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
              whileHover={{ 
                opacity: 0.3,
                x: ["-100%", "100%"]
              }}
              transition={{ 
                duration: 0.8,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard