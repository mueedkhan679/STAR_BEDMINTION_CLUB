# Supabase Migration - Component Examples

This document shows how to migrate your existing React components from using Axios/Express to Supabase.

## Migration Overview

**Before (with Express/Prisma):**
```typescript
import axios from 'axios'

// Fetch all players
const response = await axios.get('/api/players')
const players = response.data
```

**After (with Supabase):**
```typescript
import { supabase } from '../lib/supabase'

// Fetch all players
const { data, error } = await supabase.from('players').select('*')
const players = data
```

---

## Example 1: Login Component Migration

### Before (client/src/pages/Login.tsx)
```typescript
import axios from 'axios'

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  try {
    const response = await axios.post('/api/auth/login', {
      username,
      password
    })
    const { token, user } = response.data
    onLogin(token, user)
  } catch (error) {
    toast.error('Login failed')
  }
}
```

### After (with Supabase)
```typescript
import { supabase } from '../lib/supabase'

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  try {
    // Fetch admin from Supabase
    const { data, error } = await supabase
      .from('admin')
      .select('*')
      .eq('username', username)
      .single()

    if (error || !data) {
      toast.error('Invalid credentials')
      return
    }

    // Check password (in production, use bcrypt)
    if (data.password === password) {
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(data))
      toast.success('Login successful!')
      onLogin(data)
    } else {
      toast.error('Invalid credentials')
    }
  } catch (error) {
    toast.error('Login failed')
  }
}
```

---

## Example 2: Dashboard Component Migration

### Before
```typescript
import axios from 'axios'

useEffect(() => {
  async function fetchDashboardData() {
    const [paymentsRes, investmentsRes, shuttleRes, playersRes] = await Promise.all([
      axios.get('/api/payments'),
      axios.get('/api/investments'),
      axios.get('/api/shuttle/stock'),
      axios.get('/api/players')
    ])
    // Process data...
  }
  fetchDashboardData()
}, [])
```

### After
```typescript
import { supabase } from '../lib/supabase'

useEffect(() => {
  async function fetchDashboardData() {
    const [paymentsRes, investmentsRes, shuttleRes, playersRes] = await Promise.all([
      supabase.from('payments').select('amount'),
      supabase.from('investments').select('amount'),
      supabase.from('shuttle_stock').select('*').single(),
      supabase.from('players').select('*', { count: 'exact', head: true })
    ])

    const totalPayments = paymentsRes.data?.reduce((sum, p) => sum + p.amount, 0) || 0
    const totalInvestment = investmentsRes.data?.reduce((sum, i) => sum + i.amount, 0) || 0
    
    setStats({
      totalPayments,
      currentBalance: totalPayments - totalInvestment,
      totalInvestment,
      totalShuttleStock: shuttleRes.data?.total_stock || 0,
      remainingShuttleStock: shuttleRes.data?.remaining || 0,
      totalPlayers: playersRes.count || 0
    })
  }
  fetchDashboardData()
}, [])
```

---

## Example 3: Players Component Migration

### Before
```typescript
import axios from 'axios'

// Fetch all players
const fetchPlayers = async () => {
  const response = await axios.get('/api/players')
  setPlayers(response.data)
}

// Create player
const handleSubmit = async (e: React.FormEvent) => {
  await axios.post('/api/players', formData)
  fetchPlayers()
}

// Update player
const handleEdit = async (player: Player) => {
  await axios.put(`/api/players/${player.id}`, formData)
  fetchPlayers()
}

// Delete player
const handleDelete = async (id: string) => {
  await axios.delete(`/api/players/${id}`)
  fetchPlayers()
}

// Search players
const handleSearch = async () => {
  const response = await axios.get(`/api/players/search/${query}`)
  setPlayers(response.data)
}
```

### After
```typescript
import { supabase } from '../lib/supabase'

// Fetch all players
const fetchPlayers = async () => {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (data) setPlayers(data)
}

// Create player
const handleSubmit = async (e: React.FormEvent) => {
  const { data, error } = await supabase
    .from('players')
    .insert([{
      ...formData,
      player_code: 'SB' + String(Date.now()).slice(-3) // Generate code
    }])
    .select()
    .single()
  
  if (data) {
    toast.success('Player added successfully')
    fetchPlayers()
    closeModal()
  }
}

// Update player
const handleEdit = async (player: Player) => {
  const { data, error } = await supabase
    .from('players')
    .update(formData)
    .eq('id', player.id)
    .select()
    .single()
  
  if (data) {
    toast.success('Player updated successfully')
    fetchPlayers()
  }
}

// Delete player
const handleDelete = async (id: string) => {
  const { error } = await supabase
    .from('players')
    .delete()
    .eq('id', id)
  
  if (!error) {
    toast.success('Player deleted successfully')
    fetchPlayers()
  }
}

// Search players
const handleSearch = async () => {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .or(`name.ilike.%${query}%,father_name.ilike.%${query}%,player_code.ilike.%${query}%`)
    .order('created_at', { ascending: false })
  
  if (data) setPlayers(data)
}
```

---

## Example 4: Payments Component Migration

### Before
```typescript
import axios from 'axios'

// Fetch payments
const fetchPayments = async () => {
  const response = await axios.get('/api/payments')
  setPayments(response.data)
}

// Add single payment
const addSinglePayment = async (playerId: string, amount: number) => {
  await axios.post('/api/payments/single', { playerId, amount })
  fetchPayments()
}

// Add multiple payments
const addMultiplePayments = async (playerIds: string[], amount: number) => {
  await axios.post('/api/payments/multiple', { playerIds, amount })
  fetchPayments()
}

// Add payment for all players
const addPaymentForAll = async (amount: number) => {
  await axios.post('/api/payments/all', { amount })
  fetchPayments()
}
```

### After
```typescript
import { supabase } from '../lib/supabase'

// Fetch payments with player details
const fetchPayments = async () => {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      player:players(*)
    `)
    .order('date', { ascending: false })
  
  if (data) setPayments(data)
}

// Add single payment
const addSinglePayment = async (playerId: string, amount: number) => {
  const now = new Date()
  const timeString = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  })

  const { data, error } = await supabase
    .from('payments')
    .insert([{
      player_id: playerId,
      amount: amount,
      date: now.toISOString(),
      time: timeString
    }])
    .select()
    .single()

  if (data) {
    toast.success('Payment added successfully')
    fetchPayments()
  }
}

// Add multiple payments
const addMultiplePayments = async (playerIds: string[], amount: number) => {
  const now = new Date()
  const timeString = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  })

  const payments = playerIds.map(playerId => ({
    player_id: playerId,
    amount: amount,
    date: now.toISOString(),
    time: timeString
  }))

  const { data, error } = await supabase
    .from('payments')
    .insert(payments)

  if (!error) {
    toast.success('Payments added successfully')
    fetchPayments()
  }
}

// Add payment for all players
const addPaymentForAll = async (amount: number) => {
  // First get all players
  const { data: players } = await supabase
    .from('players')
    .select('id')

  if (!players || players.length === 0) return

  const now = new Date()
  const timeString = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  })

  const payments = players.map(player => ({
    player_id: player.id,
    amount: amount,
    date: now.toISOString(),
    time: timeString
  }))

  const { data, error } = await supabase
    .from('payments')
    .insert(payments)

  if (!error) {
    toast.success('Payments added for all players')
    fetchPayments()
  }
}
```

---

## Example 5: Investments Component Migration

### Before
```typescript
import axios from 'axios'

const fetchInvestments = async () => {
  const response = await axios.get('/api/investments')
  setInvestments(response.data)
}

const handleSubmit = async (e: React.FormEvent) => {
  await axios.post('/api/investments', {
    expenseType: formData.expenseType,
    amount: parseFloat(formData.amount),
    quantity: formData.quantity ? parseInt(formData.quantity) : undefined
  })
  fetchInvestments()
}
```

### After
```typescript
import { supabase } from '../lib/supabase'

const fetchInvestments = async () => {
  const { data, error } = await supabase
    .from('investments')
    .select('*')
    .order('date', { ascending: false })
  
  if (data) setInvestments(data)
}

const handleSubmit = async (e: React.FormEvent) => {
  const now = new Date()
  const timeString = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  })

  const { data, error } = await supabase
    .from('investments')
    .insert([{
      expense_type: formData.expenseType,
      amount: parseFloat(formData.amount),
      quantity: formData.quantity ? parseInt(formData.quantity) : null,
      date: now.toISOString(),
      time: timeString
    }])
    .select()
    .single()

  if (data) {
    toast.success('Investment added successfully')
    fetchInvestments()
    closeModal()
  }
}
```

---

## Example 6: Shuttle Component Migration

### Before
```typescript
import axios from 'axios'

const fetchStock = async () => {
  const response = await axios.get('/api/shuttle/stock')
  setStock(response.data)
}

const handleUseShuttle = async (quantity: number) => {
  await axios.post('/api/shuttle/use', { quantity })
  fetchStock()
}
```

### After
```typescript
import { supabase } from '../lib/supabase'

const fetchStock = async () => {
  const { data, error } = await supabase
    .from('shuttle_stock')
    .select('*')
    .single()
  
  if (data) setStock(data)
}

const handleUseShuttle = async (quantity: number) => {
  // First get current stock
  const { data: currentStock } = await supabase
    .from('shuttle_stock')
    .select('*')
    .single()

  if (!currentStock || currentStock.remaining < quantity) {
    toast.error('Insufficient stock')
    return
  }

  // Update stock
  const { data, error } = await supabase
    .from('shuttle_stock')
    .update({
      used_stock: currentStock.used_stock + quantity,
      remaining: currentStock.remaining - quantity
    })
    .eq('id', currentStock.id)
    .select()
    .single()

  if (data) {
    toast.success('Shuttle usage recorded')
    fetchStock()
  }
}
```

---

## Example 7: Records Component Migration

### Before
```typescript
import axios from 'axios'

const fetchData = async () => {
  const [paymentsRes, investmentsRes] = await Promise.all([
    axios.get('/api/payments'),
    axios.get('/api/investments')
  ])
  setPayments(paymentsRes.data)
  setInvestments(investmentsRes.data)
}

const handleDeletePayment = async (id: string) => {
  await axios.delete(`/api/payments/${id}`)
  fetchData()
}
```

### After
```typescript
import { supabase } from '../lib/supabase'

const fetchData = async () => {
  const [paymentsRes, investmentsRes] = await Promise.all([
    supabase.from('payments').select(`
      *,
      player:players(*)
    `).order('date', { ascending: false }),
    supabase.from('investments').select('*').order('date', { ascending: false })
  ])
  
  if (paymentsRes.data) setPayments(paymentsRes.data)
  if (investmentsRes.data) setInvestments(investmentsRes.data)
}

const handleDeletePayment = async (id: string) => {
  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', id)
  
  if (!error) {
    toast.success('Payment deleted')
    fetchData()
  }
}
```

---

## Key Changes Summary

1. **Remove Axios imports** - Use Supabase client instead
2. **Update API calls**:
   - `axios.get('/api/players')` → `supabase.from('players').select('*')`
   - `axios.post('/api/players', data)` → `supabase.from('players').insert([data])`
   - `axios.put('/api/players/:id', data)` → `supabase.from('players').update(data).eq('id', id)`
   - `axios.delete('/api/players/:id')` → `supabase.from('players').delete().eq('id', id)`

3. **Handle responses**:
   - Before: `response.data`
   - After: `{ data, error } = await supabase...`

4. **Remove backend server** - All operations go directly to Supabase

5. **Update environment variables**:
   - Remove: Backend API URLs
   - Add: Supabase URL and anon key

---

## Complete Component Migration Checklist

- [ ] Login.tsx - Migrate authentication
- [ ] Dashboard.tsx - Migrate stats fetching
- [ ] Players.tsx - Migrate CRUD operations
- [ ] Payments.tsx - Migrate payment operations
- [ ] Investments.tsx - Migrate investment operations
- [ ] Shuttle.tsx - Migrate stock operations
- [ ] Records.tsx - Migrate records fetching
- [ ] Remove all axios imports
- [ ] Remove API base URL configuration
- [ ] Test all functionality

---

## Testing Your Migration

1. Start the Supabase local development (if using):
   ```bash
   npx supabase start
   ```

2. Or use your Supabase cloud project

3. Update `client/.env` with your Supabase credentials

4. Run the frontend:
   ```bash
   cd client
   npm run dev
   ```

5. Test all features:
   - Login
   - Add/edit/delete players
   - Add payments
   - Add investments
   - Manage shuttle stock
   - View records
   - Export PDF

---

## Notes

- Supabase returns data in `{ data, error }` format
- Always check for errors
- Use `.single()` when expecting a single record
- Use `.select('*')` to fetch all columns
- Use `.eq(column, value)` for WHERE conditions
- Use `.order(column, { ascending: false })` for sorting
- Use `.limit(n)` to limit results