import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'
import { Plus, DollarSign, Users, UserCheck, Trash2, Edit2 } from 'lucide-react'
import toast from 'react-hot-toast'

// Email sending function using Resend
const sendPaymentEmail = async (payment: any, player: any, installmentNumber: number) => {
  try {
    const apiKey = import.meta.env.VITE_RESEND_API_KEY
    
    if (!apiKey) {
      console.log('Resend API key not configured, skipping email')
      return
    }

    if (!player?.email) {
      console.log('Player has no email, skipping email send')
      return
    }

    const formattedDate = new Date(payment.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Confirmation - Star Badminton Club</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 20px; }
        .container { max-width: 600px; width: 100%; background: white; border-radius: 20px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: white; }
        .header h1 { font-size: 32px; margin-bottom: 10px; font-weight: bold; }
        .header p { font-size: 16px; opacity: 0.9; }
        .trophy-icon { font-size: 60px; margin-bottom: 20px; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; color: #333; margin-bottom: 20px; }
        .player-info { background: #f8f9fa; border-radius: 15px; padding: 25px; margin-bottom: 25px; border-left: 5px solid #667eea; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e0e0e0; }
        .info-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
        .info-label { font-weight: bold; color: #555; font-size: 14px; }
        .info-value { color: #333; font-size: 14px; font-weight: 600; }
        .amount-highlight { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 15px; text-align: center; margin: 25px 0; box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3); }
        .amount-label { font-size: 14px; opacity: 0.9; margin-bottom: 5px; }
        .amount-value { font-size: 36px; font-weight: bold; }
        .thank-you { text-align: center; padding: 20px; background: #fff3cd; border-radius: 15px; margin-top: 25px; border: 2px solid #ffc107; }
        .thank-you h2 { color: #856404; font-size: 20px; margin-bottom: 10px; }
        .thank-you p { color: #856404; font-size: 14px; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
        .footer p { margin: 5px 0; }
        .club-name { font-weight: bold; color: #667eea; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="trophy-icon">🏆</div>
            <h1>Star Badminton Club</h1>
            <p>Payment Confirmation Receipt</p>
        </div>
        <div class="content">
            <div class="greeting">Dear <strong>${player.name}</strong>,</div>
            <p style="color: #666; margin-bottom: 25px; line-height: 1.6;">Thank you for your payment! We have successfully received your installment payment. Here are your payment details:</p>
            <div class="player-info">
                <div class="info-row"><span class="info-label">Player Name:</span><span class="info-value">${player.name}</span></div>
                <div class="info-row"><span class="info-label">Father's Name:</span><span class="info-value">${player.father_name}</span></div>
                <div class="info-row"><span class="info-label">Installment Number:</span><span class="info-value">#${installmentNumber}</span></div>
                <div class="info-row"><span class="info-label">Payment Date:</span><span class="info-value">${formattedDate}</span></div>
                <div class="info-row"><span class="info-label">Payment Time:</span><span class="info-value">${payment.time}</span></div>
            </div>
            <div class="amount-highlight">
                <div class="amount-label">Payment Amount</div>
                <div class="amount-value">Rs. ${payment.amount.toFixed(2)}</div>
            </div>
            <div class="thank-you">
                <h2>🙏 Thank You!</h2>
                <p>We appreciate your prompt payment and continued support of Star Badminton Club.</p>
            </div>
        </div>
        <div class="footer">
            <p class="club-name">Star Badminton Club</p>
            <p>Management System</p>
            <p style="margin-top: 10px; font-size: 11px;">Software made by Abdul Mueed Khan</p>
        </div>
    </div>
</body>
</html>
    `

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: 'Star Badminton Club <onboarding@resend.dev>',
        to: [player.email],
        subject: `Payment Confirmation - Installment #${installmentNumber} - Star Badminton Club`,
        html: emailHtml
      })
    })

    if (response.ok) {
      console.log('Email sent successfully to:', player.email)
    } else {
      const error = await response.json()
      console.error('Failed to send email:', error)
    }
  } catch (error) {
    console.error('Error sending email:', error)
  }
}

interface Player {
  id: string
  player_code: string
  name: string
  father_name: string
  picture?: string
}

interface Payment {
  id: string
  player_id: string
  amount: number
  date: string
  time: string
  installment_number?: number
  player: Player
}

function Payments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [paymentType, setPaymentType] = useState<'single' | 'multiple' | 'all'>('single')
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const [amount, setAmount] = useState('')
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [paymentsRes, playersRes] = await Promise.all([
        supabase.from('payments').select(`
          *,
          player:players(*)
        `).order('date', { ascending: false }),
        supabase.from('players').select('*').order('created_at', { ascending: false })
      ])
      
      if (paymentsRes.data) setPayments(paymentsRes.data)
      if (playersRes.data) setPlayers(playersRes.data)
    } catch (error) {
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const getInstallmentNumber = async (playerId: string): Promise<number> => {
    try {
      const { data: player } = await supabase
        .from('players')
        .select('name, father_name')
        .eq('id', playerId)
        .single()

      if (!player) return 1

      const { data: payments } = await supabase
        .from('payments')
        .select('id')
        .eq('player_id', playerId)

      return (payments?.length || 0) + 1
    } catch (error) {
      console.error('Error getting installment number:', error)
      return 1
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

      if (editingPayment) {
        const { error } = await supabase
          .from('payments')
          .update({ amount: parseFloat(amount) })
          .eq('id', editingPayment.id)
        
        if (error) {
          console.error('Update error:', error)
          throw error
        }
        toast.success('Payment updated successfully')
      } else {
        if (paymentType === 'single' && selectedPlayers.length === 1) {
          const installmentNumber = await getInstallmentNumber(selectedPlayers[0])
          
          const paymentData = {
            player_id: selectedPlayers[0],
            amount: parseFloat(amount),
            date: now.toISOString(),
            time: timeString,
            installment_number: installmentNumber
          }
          
          const { error } = await supabase
            .from('payments')
            .insert([paymentData])
          
          if (error) {
            console.error('Insert error:', error)
            throw error
          }
          
          // Send email notification (async, don't wait)
          const { data: playerData } = await supabase
            .from('players')
            .select('*')
            .eq('id', selectedPlayers[0])
            .single()
          
          if (playerData) {
            sendPaymentEmail(paymentData, playerData, installmentNumber)
          }
          
          toast.success(`Payment added - Installment ${installmentNumber}`)
        } else if (paymentType === 'multiple' && selectedPlayers.length > 1) {
          const paymentsWithInstallments = await Promise.all(
            selectedPlayers.map(async (playerId) => {
              const installmentNumber = await getInstallmentNumber(playerId)
              return {
                player_id: playerId,
                amount: parseFloat(amount),
                date: now.toISOString(),
                time: timeString,
                installment_number: installmentNumber
              }
            })
          )
          
          const { error } = await supabase
            .from('payments')
            .insert(paymentsWithInstallments)
          
          if (error) {
            console.error('Multiple insert error:', error)
            throw error
          }
          
          // Send emails for all players (async, don't wait)
          for (let i = 0; i < paymentsWithInstallments.length; i++) {
            const { data: playerData } = await supabase
              .from('players')
              .select('*')
              .eq('id', selectedPlayers[i])
              .single()
            
            if (playerData) {
              sendPaymentEmail(paymentsWithInstallments[i], playerData, paymentsWithInstallments[i].installment_number)
            }
          }
          
          toast.success('Payments added successfully')
        } else if (paymentType === 'all') {
          const { data: allPlayers } = await supabase
            .from('players')
            .select('id')
          
          if (allPlayers && allPlayers.length > 0) {
            const paymentsWithInstallments = await Promise.all(
              allPlayers.map(async (player: any) => {
                const installmentNumber = await getInstallmentNumber(player.id)
                return {
                  player_id: player.id,
                  amount: parseFloat(amount),
                  date: now.toISOString(),
                  time: timeString,
                  installment_number: installmentNumber
                }
              })
            )
            
            const { error } = await supabase
              .from('payments')
              .insert(paymentsWithInstallments)
            
            if (error) {
              console.error('All players insert error:', error)
              throw error
            }
            
            // Send emails for all players (async, don't wait)
            for (let i = 0; i < paymentsWithInstallments.length; i++) {
              const { data: playerData } = await supabase
                .from('players')
                .select('*')
                .eq('id', allPlayers[i].id)
                .single()
              
              if (playerData) {
                sendPaymentEmail(paymentsWithInstallments[i], playerData, paymentsWithInstallments[i].installment_number)
              }
            }
            
            toast.success('All payments added successfully')
          }
        }
      }

      fetchData()
      closeModal()
    } catch (error: any) {
      console.error('Full error:', error)
      toast.error(error.message || 'Operation failed')
    }
  }

  const handleDelete = async (id: string) => {
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

  const openModal = (payment?: Payment) => {
    if (payment) {
      setEditingPayment(payment)
      setAmount(payment.amount.toString())
    } else {
      setEditingPayment(null)
      setAmount('')
      setSelectedPlayers([])
      setPaymentType('single')
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingPayment(null)
    setAmount('')
    setSelectedPlayers([])
    setPaymentType('single')
  }

  const togglePlayerSelection = (playerId: string) => {
    setSelectedPlayers(prev =>
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    )
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Payments</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage player payments</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Payment
        </button>
      </div>

      {/* Payments Table */}
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
                    <div className="flex gap-2">
                      <button onClick={() => openModal(payment)} className="text-blue-600 hover:text-blue-800">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(payment.id)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {editingPayment ? 'Edit Payment' : 'Add Payment'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingPayment && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Type
                  </label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value as any)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="single">Single Player</option>
                    <option value="multiple">Multiple Players</option>
                    <option value="all">All Players</option>
                  </select>
                </div>
              )}

              {!editingPayment && paymentType !== 'all' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Player(s)
                  </label>
                  <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2">
                    {players.map(player => (
                      <div
                        key={player.id}
                        onClick={() => togglePlayerSelection(player.id)}
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          selectedPlayers.includes(player.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedPlayers.includes(player.id)}
                          onChange={() => {}}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{player.name} ({player.player_code})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount (Rs.)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

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
                  {editingPayment ? 'Update' : 'Add'} Payment
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Payments