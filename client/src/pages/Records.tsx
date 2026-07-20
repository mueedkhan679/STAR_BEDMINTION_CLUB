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
  const [showPDFModal, setShowPDFModal] = useState(false)
  const [pdfType, setPdfType] = useState<'payments' | 'investments'>('payments')
  const [selectedInstallment, setSelectedInstallment] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'all' | 'separate'>('all')

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

  const handlePDFConfirm = async (installmentNumber?: number | null) => {
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

      // Transform payments data - filter by specific installment if selected
      let paymentsData: PaymentData[] = []
      
      if (pdfType === 'payments') {
        let filteredPayments = payments
        
        // Filter by specific installment number (exact match, not cumulative)
        // Use the passed parameter instead of state to avoid race condition
        const installmentToFilter = installmentNumber !== undefined ? installmentNumber : selectedInstallment
        
        // DEBUG: Log all payment installment numbers
        console.log('=== PDF Generation Debug ===')
        console.log('All payments installment numbers:', payments.map(p => ({ id: p.id, installment: p.installment_number, player: p.player.name })))
        
        if (installmentToFilter !== null) {
          console.log(`Filtering for installment: ${installmentToFilter}`)
          filteredPayments = payments.filter(p => (p.installment_number || 0) === installmentToFilter)
          console.log(`Found ${filteredPayments.length} payments for installment ${installmentToFilter}`)
          console.log('Filtered payments:', filteredPayments.map(p => ({ id: p.id, installment: p.installment_number, player: p.player.name })))
        } else {
          console.log('No filter applied - showing all payments')
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
        // Update PDF title based on selection
        const installmentToFilter = installmentNumber !== undefined ? installmentNumber : selectedInstallment
        console.log(`Generating PDF for installment: ${installmentToFilter}`)
        console.log(`PDF will contain ${paymentsData.length} payments`)
        
        if (installmentToFilter !== null) {
          pdfGenerator.generatePlayerRecordsPDF(playersList, paymentsData, investmentsData, shuttleStock, `Installment ${installmentToFilter} - Payment Records Report`)
        } else {
          pdfGenerator.generatePlayerRecordsPDF(playersList, paymentsData, investmentsData, shuttleStock)
        }
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

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-1 sm:mb-2">Records</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">View and manage all records</p>
        </div>
        <button
          onClick={generatePDF}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <Download className="w-4 h-4 sm:w-5 sm:h-5" />
          Export PDF
        </button>
      </div>

      {/* Tabs - Responsive */}
      <div className="mb-4 sm:mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex gap-2 sm:gap-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('payments')}
              className={`pb-3 sm:pb-4 px-2 sm:px-2 font-medium transition-colors whitespace-nowrap text-xs sm:text-sm ${
                activeTab === 'payments'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800'
              }`}
            >
              Payments ({payments.length})
            </button>
            <button
              onClick={() => setActiveTab('investments')}
              className={`pb-3 sm:pb-4 px-2 sm:px-2 font-medium transition-colors whitespace-nowrap text-xs sm:text-sm ${
                activeTab === 'investments'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800'
              }`}
            >
              Investments ({investments.length})
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
            {pdfType === 'payments' && (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Select installment number to generate report:
                </p>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <button
                    onClick={() => handlePDFConfirm(1)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-semibold"
                  >
                    Installment 1
                  </button>
                  <button
                    onClick={() => handlePDFConfirm(2)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-semibold"
                  >
                    Installment 2
                  </button>
                  <button
                    onClick={() => handlePDFConfirm(3)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-semibold"
                  >
                    Installment 3
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <button
                    onClick={() => handlePDFConfirm(4)}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-semibold"
                  >
                    Installment 4
                  </button>
                  <button
                    onClick={() => handlePDFConfirm(5)}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-semibold"
                  >
                    Installment 5
                  </button>
                </div>
                <button
                  onClick={() => handlePDFConfirm(null)}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-lg hover:from-orange-600 hover:to-red-700 transition-all font-semibold"
                >
                  All Installments
                </button>
              </>
            )}
            {pdfType === 'investments' && (
              <button
                onClick={() => handlePDFConfirm(null)}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-lg hover:from-orange-600 hover:to-red-700 transition-all font-semibold"
              >
                Generate Complete Report
              </button>
            )}
            <button
              onClick={() => {
                setShowPDFModal(false)
                setSelectedInstallment(null)
              }}
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
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              onClick={handleDeleteAllPayments}
              className="bg-red-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 text-sm sm:text-base"
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Delete All</span>
            </button>
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => setViewMode('all')}
                className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                  viewMode === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
                }`}
              >
                All Payments
              </button>
              <button
                onClick={() => setViewMode('separate')}
                className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                  viewMode === 'separate'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
                }`}
              >
                By Installment
              </button>
            </div>
          </div>

          {viewMode === 'all' ? (
            /* All Payments View */
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Player</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Code</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Installment</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Time</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
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
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            {payment.player.picture ? (
                              <img src={payment.player.picture} alt={payment.player.name} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover" />
                            ) : (
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                                {payment.player.name.charAt(0)}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm truncate">{payment.player.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate hidden sm:block">{payment.player.father_name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300">{payment.player.player_code}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                          {payment.installment_number ? `#${payment.installment_number}` : '-'}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400">Rs. {payment.amount.toFixed(2)}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300">{new Date(payment.date).toLocaleDateString()}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300">{payment.time}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <button onClick={() => handleDeletePayment(payment.id)} className="text-red-600 hover:text-red-800">
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Separate Installments View */
            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map(installmentNum => {
                const installmentPayments = payments.filter(p => (p.installment_number || 0) === installmentNum)
                if (installmentPayments.length === 0) return null

                return (
                  <div key={installmentNum} className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 sm:px-6 py-3 sm:py-4">
                      <h3 className="text-lg sm:text-xl font-bold text-white">
                        Installment {installmentNum} ({installmentPayments.length} {installmentPayments.length === 1 ? 'payment' : 'payments'})
                      </h3>
                      <p className="text-blue-100 text-xs sm:text-sm mt-1">
                        Total: Rs. {installmentPayments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[640px]">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Player</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Code</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Time</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {installmentPayments.map((payment, index) => (
                            <motion.tr
                              key={payment.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            >
                              <td className="px-3 sm:px-6 py-3 sm:py-4">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  {payment.player.picture ? (
                                    <img src={payment.player.picture} alt={payment.player.name} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover" />
                                  ) : (
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                                      {payment.player.name.charAt(0)}
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <div className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm truncate">{payment.player.name}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate hidden sm:block">{payment.player.father_name}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300">{payment.player.player_code}</td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400">Rs. {payment.amount.toFixed(2)}</td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300">{new Date(payment.date).toLocaleDateString()}</td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300">{payment.time}</td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4">
                                <button onClick={() => handleDeletePayment(payment.id)} className="text-red-600 hover:text-red-800">
                                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Investment Records */}
      {activeTab === 'investments' && (
        <div>
          <div className="mb-4">
            <button
              onClick={handleDeleteAllInvestments}
              className="bg-red-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 text-sm sm:text-base"
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Delete All</span>
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Expense Type</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Qty</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Time</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
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
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <span className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm truncate">{investment.expense_type}</span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400">Rs. {investment.amount.toFixed(2)}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300">{investment.quantity || '-'}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300">{new Date(investment.date).toLocaleDateString()}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300">{investment.time}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <button onClick={() => handleDeleteInvestment(investment.id)} className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
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