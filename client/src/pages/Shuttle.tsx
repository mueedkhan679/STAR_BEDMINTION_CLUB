import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { calculateShuttleStock, useShuttles, resetShuttleStock } from '../lib/stockUtils'
import { motion } from 'framer-motion'
import { Package, PackageOpen, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'

interface StockData {
  totalPurchased: number
  totalUsed: number
  remaining: number
}

function Shuttle() {
  const [stock, setStock] = useState<StockData>({
    totalPurchased: 0,
    totalUsed: 0,
    remaining: 0
  })
  const [showUseModal, setShowUseModal] = useState(false)
  const [useQuantity, setUseQuantity] = useState('')

  useEffect(() => {
    fetchStock()
  }, [])

  const fetchStock = async () => {
    try {
      const data = await calculateShuttleStock()
      setStock(data)
    } catch (error) {
      console.error('Error in fetchStock:', error)
      toast.error('Failed to fetch shuttle stock')
    }
  }

  const handleUseShuttle = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const quantity = parseInt(useQuantity)

      if (stock.remaining < quantity) {
        toast.error('Insufficient shuttle stock')
        return
      }

      if (stock.remaining === 0) {
        toast.error('Stock empty, please purchase more shuttles')
        return
      }

      const success = await useShuttles(quantity)

      if (success) {
        toast.success('Shuttle usage recorded')
        await fetchStock() // Refresh stock data
        setShowUseModal(false)
        setUseQuantity('')
      } else {
        toast.error('Failed to record usage')
      }
    } catch (error: any) {
      console.error('Error using shuttles:', error)
      toast.error(error.message || 'Failed to record usage')
    }
  }

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset shuttle stock? This will set used stock to 0.')) return

    try {
      const success = await resetShuttleStock()

      if (success) {
        toast.success('Shuttle stock reset successfully')
        await fetchStock()
      } else {
        toast.error('Failed to reset stock')
      }
    } catch (error) {
      toast.error('Failed to reset stock')
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-1 sm:mb-2">Shuttle Usage</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Track and manage shuttle stock</p>
      </div>

      {/* Stock Cards - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-md sm:shadow-lg text-white"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <Package className="w-8 h-8 sm:w-12 sm:h-12" />
          </div>
          <h3 className="text-blue-100 text-xs sm:text-sm font-medium mb-1 sm:mb-2">Total Purchased</h3>
          <p className="text-2xl sm:text-4xl font-bold">{stock.totalPurchased}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-md sm:shadow-lg text-white"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <PackageOpen className="w-8 h-8 sm:w-12 sm:h-12" />
          </div>
          <h3 className="text-orange-100 text-xs sm:text-sm font-medium mb-1 sm:mb-2">Total Used</h3>
          <p className="text-2xl sm:text-4xl font-bold">{stock.totalUsed}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-md sm:shadow-lg text-white"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <Package className="w-8 h-8 sm:w-12 sm:h-12" />
          </div>
          <h3 className="text-green-100 text-xs sm:text-sm font-medium mb-1 sm:mb-2">Remaining Stock</h3>
          <p className="text-2xl sm:text-4xl font-bold">{stock.remaining}</p>
        </motion.div>
      </div>

      {/* Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6">Actions</h2>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={() => setShowUseModal(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <PackageOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            Use Shuttle
          </button>
          <button
            onClick={handleReset}
            className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-700 transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            Reset Stock
          </button>
        </div>
      </div>

      {/* Use Shuttle Modal */}
      {showUseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Use Shuttle</h2>
              <button onClick={() => setShowUseModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <form onSubmit={handleUseShuttle} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quantity to Use
                </label>
                <input
                  type="number"
                  value={useQuantity}
                  onChange={(e) => setUseQuantity(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                  min="1"
                  max={stock.remaining}
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Available: {stock.remaining} shuttles
                </p>
                {stock.remaining === 0 && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1 font-medium">
                    Stock empty, please purchase more shuttles
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUseModal(false)}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
                >
                  Use Shuttle
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Shuttle