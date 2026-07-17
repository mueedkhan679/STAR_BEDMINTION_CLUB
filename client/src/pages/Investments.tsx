import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'
import { Plus, Trash2, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'

interface Investment {
  id: string
  expense_type: string
  amount: number
  quantity?: number
  date: string
  time: string
}

function Investments() {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    expense_type: 'Shuttle',
    amount: '',
    quantity: '',
    customExpense: ''
  })

  useEffect(() => {
    fetchInvestments()
  }, [])

  const fetchInvestments = async () => {
    try {
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .order('date', { ascending: false })
      
      if (error) throw error
      if (data) setInvestments(data)
    } catch (error) {
      toast.error('Failed to fetch investments')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const now = new Date()
      const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })

      const expenseType = formData.expense_type === 'Custom' ? formData.customExpense : formData.expense_type

      const { error } = await supabase
        .from('investments')
        .insert([{
          expense_type: expenseType,
          amount: parseFloat(formData.amount),
          quantity: formData.quantity ? parseInt(formData.quantity) : null,
          date: now.toISOString(),
          time: timeString
        }])
      
      if (error) {
        console.error('Insert error:', error)
        throw error
      }
      toast.success('Investment added successfully')
      fetchInvestments()
      closeModal()
    } catch (error: any) {
      console.error('Full error:', error)
      toast.error(error.message || 'Operation failed')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return

    try {
      const { error } = await supabase
        .from('investments')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      toast.success('Record deleted successfully')
      fetchInvestments()
    } catch (error) {
      toast.error('Failed to delete record')
    }
  }

  const handleDeleteAll = async () => {
    if (!confirm('Are you sure you want to delete all records? This action cannot be undone.')) return

    try {
      const { error } = await supabase
        .from('investments')
        .delete()
      
      if (error) throw error
      toast.success('All records deleted successfully')
      fetchInvestments()
    } catch (error) {
      toast.error('Failed to delete records')
    }
  }

  const openModal = () => {
    setFormData({
      expense_type: 'Shuttle',
      amount: '',
      quantity: '',
      customExpense: ''
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Expenses & Investments</h1>
          <p className="text-gray-600 dark:text-gray-400">Track club expenses and investments</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDeleteAll}
            className="bg-red-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            Delete All
          </button>
          <button
            onClick={openModal}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Record
          </button>
        </div>
      </div>

      {/* Investments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Expense Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Quantity</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Time</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {investments.map((investment, index) => (
                <motion.tr
                  key={investment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-gray-900 dark:text-white">{investment.expense_type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-green-600 dark:text-green-400">Rs. {investment.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{investment.quantity || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{new Date(investment.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{investment.time}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleDelete(investment.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Add Investment/Expense</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expense Type
                </label>
                <select
                  value={formData.expense_type}
                  onChange={(e) => setFormData({ ...formData, expense_type: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="Shuttle">Shuttle</option>
                  <option value="Court Rent">Court Rent</option>
                  <option value="Repair">Repair</option>
                  <option value="Custom">Custom (Enter Below)</option>
                </select>
                
                {formData.expense_type === 'Custom' && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Custom Expense Name
                    </label>
                    <input
                      type="text"
                      value={formData.customExpense}
                      onChange={(e) => setFormData({ ...formData, customExpense: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter expense name"
                      required
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount (Rs.)
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              {formData.expense_type === 'Shuttle' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                    min="1"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
                >
                  Add Record
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Investments