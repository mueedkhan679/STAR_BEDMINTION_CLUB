// Supabase configuration
// Get these from your Supabase project settings
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-id.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key-here'

// Import Supabase client
import { createClient } from '@supabase/supabase-js'

// Create and export the real Supabase client
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)

console.log('✅ Supabase client initialized')

// Database types
export interface Player {
  id: string
  player_code: string
  name: string
  father_name: string
  address: string
  email?: string
  picture?: string
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  player_id: string
  amount: number
  date: string
  time: string
  created_at: string
  updated_at: string
  player?: Player
}

export interface Investment {
  id: string
  expense_type: string
  amount: number
  quantity?: number
  date: string
  time: string
  created_at: string
  updated_at: string
}

export interface ShuttleStock {
  id: string
  total_stock: number
  used_stock: number
  remaining: number
  created_at: string
  updated_at: string
}

export interface Admin {
  id: string
  username: string
  password: string
  created_at: string
  updated_at: string
}