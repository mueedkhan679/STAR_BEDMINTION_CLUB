import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'
import { FileText, Download, Trash2, Edit2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { pdfGenerator, PlayerData, PaymentData, InvestmentData, ShuttleStock } from '../lib/pdfGenerator'

interface Player {
  id: string
  player_code: string
  name: string
  father_name: string
  address: string
  email?: string
  picture?: string
}

interface Payment {
  id: string
  amount: number
  date: string
  time: string
  installment_number?: number
  player: Player
}

interface Investment {
  id: string
  expense_type: string
  amount: number
  quantity?: number
  date: string
  time: string
}

type TabType = 'payments' | 'investments'

function Records() {
  const [activeTab, setActiveTab] = useState<TabType>('payments')
  const [payments, setPayments] = useState<Payment[]>([])
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [showPDFModal, setShowPDFModal] = useState(false)
  const [pdfType, setPdfType] = useState<'payments' | 'investments'>('payments')
  const [installmentFilter, setInstallmentFilter] = useState<'all' | '1' | '2' | '3' | '4' | '5'>('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [paymentsRes, investmentsRes] = await Promise.all([
        supabase.from('payments').select(`
          *,
          player:players(*)
        `).order('date', { ascending: false }),
        supabase.from('investments').select('*').order('date', { ascending: false })
      ])
      
      if (paymentsRes.data) setPayments(paymentsRes.data)
      if (investmentsRes.data) setInvestments(investmentsRes.data)
    } catch (error) {
      toast.error('Failed to fetch records')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePayment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment?')) return

    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      toast.success('Payment deleted successfully')
      fetchData()
    } catch (error) {
      toast.error('Failed to delete payment')
    }
  }

  const handleDeleteInvestment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return

    try {
      const { error } = await supabase
        .from('investments')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      toast.success('Record deleted successfully')
      fetchData()
    } catch (error) {
      toast.error('Failed to delete record')
    }
  }

  const handleDeleteAllPayments = async () => {
    if (!confirm('Are you sure you want to delete all payment records? This cannot be undone.')) return

    try {
      console.log('Deleting all payments...')
      const { error, count } = await supabase
        .from('payments')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all by using a condition that matches all
      
      if (error) {
        console.error('Delete all payments error:', error)
        throw error
      }
      console.log(`Deleted ${count} payments`)
      toast.success('All payment records deleted')
      fetchData()
    } catch (error: any) {
      console.error('Failed to delete records:', error)
      toast.error(error.message || 'Failed to delete records')
    }
  }

  const handleDeleteAllInvestments = async () => {
    if (!confirm('Are you sure you want to delete all investment records? This cannot be undone.')) return

    try {
      console.log('Deleting all investments...')
      const { error, count } = await supabase
        .from('investments')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all by using a condition that matches all
      
      if (error) {
        console.error('Delete all investments error:', error)
        throw error
      }
      console.log(`Deleted ${count} investments`)
      toast.success('All investment records deleted')
      fetchData()
    } catch (error: any) {
      console.error('Failed to delete records:', error)
      toast.error(error.message || 'Failed to delete records')
    }
  }

  const generatePDF = async () => {
    try {
      // Show modal to ask user what they want
      setPdfType(activeTab)
      setShowPDFModal(true)
    } catch (error) {
      console.error('PDF generation error:', error)
      toast.error('Failed to generate PDF')
    }
  }

  const handlePDFConfirm = async () => {
    setShowPDFModal(false)
    toast.loading('Generating PDF...', { duration: 2000 })
    
    try {
      // Fetch all players for the PDF
      const { data: playersData } = await supabase
        .from('players')
        .select('*')
        .order('name')

      // Fetch shuttle stock - LIVE DATA
      const { data: shuttleData } = await supabase
        .from('shuttle_stock')
        .select('*')
        .single()

      const shuttleStock: ShuttleStock = shuttleData || {
        id: '',
        total_added: 0,
        remaining: 0,
        updated_at: new Date().toISOString()
      }

      // Transform payments data - filter by installment if needed
      let paymentsData: PaymentData[] = []
      
      if (pdfType === 'payments') {
        let filteredPayments = payments
        
        // Filter by installment number (cumulative: 1 = only installment 1, 2 = installments 1-2, etc.)
        if (installmentFilter !== 'all') {
          const maxInstallment = parseInt(installmentFilter)
          filteredPayments = payments.filter(p => (p.installment_number || 0) <= maxInstallment)
        }
        
        paymentsData = filteredPayments.map(p => ({
          id: p.id,
          player_id: p.player.id,
          amount: p.amount,
          date: p.date,
          time: p.time,
          installment_number: p.installment_number || 0,
          player: p.player as any
        }))
      }

      // Transform investments data
      const investmentsData: InvestmentData[] = investments.map(inv => ({
        id: inv.id,
        expense_type: inv.expense_type,
        amount: inv.amount,
        quantity: inv.quantity,
        date: inv.date,
        time: inv.time
      }))

      // Transform players data
      const playersList: PlayerData[] = (playersData || []).map(p => ({
        id: p.id,
        name: p.name,
        father_name: p.father_name,
        address: p.address,
        email: p.email,
        player_code: p.player_code,
        created_at: p.created_at
      }))

      if (pdfType === 'payments') {
        pdfGenerator.generatePlayerRecordsPDF(playersList, paymentsData, investmentsData, shuttleStock)
        toast.success('Payment Records PDF downloaded successfully!')
      } else {
        pdfGenerator.generateInvestmentsPDF(investmentsData, shuttleStock)
        toast.success('Investments PDF downloaded successfully!')
      }
    } catch (error) {
      console.error('PDF generation error:', error)
      toast.error('Failed to generate PDF')
    }
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Records</h1>
          <p className="text-gray-600 dark:text-gray-400">View and manage all records</p>
        </div>
        <button
          onClick={generatePDF}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Export PDF
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab('payments')}
              className={`pb-4 px-2 font-medium transition-colors ${
                activeTab === 'payments'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800'
              }`}
            >
              Payment Records ({payments.length})
            </button>
            <button
              onClick={() => setActiveTab('investments')}
              className={`pb-4 px-2 font-medium transition-colors ${
                activeTab === 'investments'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800'
              }`}
            >
              Investment Records ({investments.length})
            </button>
          </nav>
        </div>
      </div>

      {/* PDF Export Modal */}
      {showPDFModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Generate PDF Report
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Select installment number to generate report:
            </p>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <button
                onClick={() => {
                  setInstallmentFilter('1')
                  setTimeout(() => handlePDFConfirm(), 100)
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-semibold"
              >
                Installment 1
              </button>
              <button
                onClick={() => {
                  setInstallmentFilter('2')
                  setTimeout(() => handlePDFConfirm(), 100)
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-semibold"
              >
                Installment 1-2
              </button>
              <button
                onClick={() => {
                  setInstallmentFilter('3')
                  setTimeout(() => handlePDFConfirm(), 100)
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-semibold"
              >
                Installment 1-3
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setInstallmentFilter('4')
                  setTimeout(() => handlePDFConfirm(), 100)
                }}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-semibold"
              >
                Installment 1-4
              </button>
              <button
                onClick={() => {
                  setInstallmentFilter('5')
                  setTimeout(() => handlePDFConfirm(), 100)
                }}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-semibold"
              >
                Installment 1-5
              </button>
            </div>
            <button
              onClick={() => {
                setInstallmentFilter('all')
                setTimeout(() => handlePDFConfirm(), 100)
              }}
              className="mt-3 w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-lg hover:from-orange-600 hover:to-red-700 transition-all font-semibold"
            >
              All Installments
            </button>
            <button
              onClick={() => setShowPDFModal(false)}
              className="mt-3 w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Payment Records */}
      {activeTab === 'payments' && (
        <div>
          <div className="mb-4">
            <button
              onClick={handleDeleteAllPayments}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete All
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Player</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Player Code</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Installment</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Time</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {payments.map((payment, index) => (
                    <motion.tr
                      key={payment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {payment.player.picture ? (
                            <img src={payment.player.picture} alt={payment.player.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                              {payment.player.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{payment.player.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{payment.player.father_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{payment.player.player_code}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {payment.installment_number ? `#${payment.installment_number}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600 dark:text-green-400">Rs. {payment.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{new Date(payment.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{payment.time}</td>
                      <td className="px-6 py-4">
                        <button onClick={() => handleDeletePayment(payment.id)} className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Investment Records */}
      {activeTab === 'investments' && (
        <div>
          <div className="mb-4">
            <button
              onClick={handleDeleteAllInvestments}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete All
            </button>
          </div>

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
                        <span className="font-medium text-gray-900 dark:text-white">{investment.expense_type}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600 dark:text-green-400">Rs. {investment.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{investment.quantity || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{new Date(investment.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{investment.time}</td>
                      <td className="px-6 py-4">
                        <button onClick={() => handleDeleteInvestment(investment.id)} className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Records