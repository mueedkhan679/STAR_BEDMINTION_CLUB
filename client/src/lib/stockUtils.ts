import { supabase } from './supabase'

export interface StockData {
  totalPurchased: number
  totalUsed: number
  remaining: number
}

/**
 * Calculate shuttle stock from investments and usage
 * Total Purchased = Sum of quantities from investments where expense_type = 'Shuttle'
 * Total Used = Sum of used_stock from shuttle_stock table
 * Remaining = Total Purchased - Total Used
 */
export const calculateShuttleStock = async (): Promise<StockData> => {
  try {
    // Get all shuttle purchases from investments
    const { data: investments, error: invError } = await supabase
      .from('investments')
      .select('quantity')
      .eq('expense_type', 'Shuttle')

    if (invError) {
      console.error('Error fetching investments:', invError)
      throw invError
    }

    // Calculate total purchased
    const totalPurchased = investments?.reduce((sum, inv) => sum + (inv.quantity || 0), 0) || 0

    // Get shuttle stock data
    const { data: stockData, error: stockError } = await supabase
      .from('shuttle_stock')
      .select('used_stock')
      .single()

    if (stockError && stockError.code !== 'PGRST116') {
      console.error('Error fetching stock:', stockError)
      // If no stock record exists, create one
      await supabase.from('shuttle_stock').insert({
        total_stock: totalPurchased,
        used_stock: 0,
        remaining: totalPurchased
      })
    }

    const totalUsed = stockData?.used_stock || 0
    const remaining = totalPurchased - totalUsed

    return {
      totalPurchased,
      totalUsed,
      remaining
    }
  } catch (error) {
    console.error('Error calculating shuttle stock:', error)
    return {
      totalPurchased: 0,
      totalUsed: 0,
      remaining: 0
    }
  }
}

/**
 * Update shuttle stock when shuttles are used
 */
export const useShuttles = async (quantity: number): Promise<boolean> => {
  try {
    const stock = await calculateShuttleStock()
    
    if (stock.remaining < quantity) {
      return false // Insufficient stock
    }

    // Get or create stock record
    const { data: stockData } = await supabase
      .from('shuttle_stock')
      .select('*')
      .single()

    let stockId = stockData?.id

    if (!stockId) {
      // Create new stock record
      const { data: newStock } = await supabase
        .from('shuttle_stock')
        .insert({
          total_stock: stock.totalPurchased,
          used_stock: quantity,
          remaining: stock.remaining - quantity
        })
        .select('id')
        .single()
      
      stockId = newStock?.id
    } else {
      // Update existing stock record
      await supabase
        .from('shuttle_stock')
        .update({
          used_stock: stock.totalUsed + quantity,
          remaining: stock.remaining - quantity
        })
        .eq('id', stockId)
    }

    return true
  } catch (error) {
    console.error('Error using shuttles:', error)
    return false
  }
}

/**
 * Reset shuttle stock (for admin use)
 */
export const resetShuttleStock = async (): Promise<boolean> => {
  try {
    const stock = await calculateShuttleStock()
    
    const { data: stockData } = await supabase
      .from('shuttle_stock')
      .select('id')
      .single()

    if (stockData) {
      await supabase
        .from('shuttle_stock')
        .update({
          used_stock: 0,
          remaining: stock.totalPurchased
        })
        .eq('id', stockData.id)
    }

    return true
  } catch (error) {
    console.error('Error resetting stock:', error)
    return false
  }
}