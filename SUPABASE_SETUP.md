# Supabase Migration Guide

This guide will help you migrate from Prisma to Supabase for the Star Badminton Club Management System.

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Create a new project
3. Wait for the project to be ready

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (e.g., `https://xyzcompany.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 3: Setup Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New query**
3. Copy and paste the entire contents of `supabase-schema.sql` file
4. Click **Run** to execute the SQL
5. This will create all tables, indexes, and the default admin user

## Step 4: Update Client package.json

Add the Supabase client library to your client dependencies:

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0"
  }
}
```

## Step 5: Environment Variables

Create a `.env` file in the `client` directory with:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: Replace with your actual Supabase project URL and anon key from Step 2.

## Step 6: Install Dependencies

```bash
cd client
npm install
```

## Step 7: Usage Examples

### Example 1: Insert a New Player

```typescript
import { supabase, Player } from './lib/supabase'

async function createPlayer() {
  const newPlayer = {
    player_code: 'SB001',
    name: 'Ahmed',
    father_name: 'Muhammad',
    address: '123 Main St',
    email: 'ahmed@example.com',
    picture: 'https://example.com/picture.jpg'
  }

  const { data, error } = await supabase
    .from('players')
    .insert([newPlayer])
    .select()
    .single()

  if (error) {
    console.error('Error creating player:', error)
    return
  }

  console.log('Player created:', data)
  return data as Player
}
```

### Example 2: Fetch All Payments with Player Details

```typescript
import { supabase, Payment } from './lib/supabase'

async function fetchAllPayments() {
  // Fetch payments with player information using join
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      player:players(*)
    `)
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching payments:', error)
    return []
  }

  console.log('All payments:', data)
  return data as Payment[]
}
```

### Example 3: Search Players

```typescript
import { supabase, Player } from './lib/supabase'

async function searchPlayers(query: string) {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .or(`name.ilike.%${query}%,father_name.ilike.%${query}%,player_code.ilike.%${query}%`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error searching players:', error)
    return []
  }

  console.log('Search results:', data)
  return data as Player[]
}
```

### Example 4: Update a Player

```typescript
import { supabase, Player } from './lib/supabase'

async function updatePlayer(playerId: string, updates: Partial<Player>) {
  const { data, error } = await supabase
    .from('players')
    .update(updates)
    .eq('id', playerId)
    .select()
    .single()

  if (error) {
    console.error('Error updating player:', error)
    return null
  }

  console.log('Player updated:', data)
  return data as Player
}
```

### Example 5: Delete a Player

```typescript
import { supabase } from './lib/supabase'

async function deletePlayer(playerId: string) {
  const { error } = await supabase
    .from('players')
    .delete()
    .eq('id', playerId)

  if (error) {
    console.error('Error deleting player:', error)
    return false
  }

  console.log('Player deleted successfully')
  return true
}
```

### Example 6: Login (Authenticate Admin)

```typescript
import { supabase, Admin } from './lib/supabase'

async function login(username: string, password: string) {
  const { data, error } = await supabase
    .from('admin')
    .select('*')
    .eq('username', username)
    .single()

  if (error || !data) {
    console.error('Invalid credentials')
    return null
  }

  // In production, use proper password hashing (bcrypt)
  // This is just for demonstration
  const admin = data as Admin
  if (admin.password === password) {
    console.log('Login successful:', admin)
    return admin
  } else {
    console.error('Invalid password')
    return null
  }
}
```

### Example 7: Add Payment for Multiple Players

```typescript
import { supabase } from './lib/supabase'

async function addPaymentsForPlayers(playerIds: string[], amount: number) {
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
    .select()

  if (error) {
    console.error('Error creating payments:', error)
    return []
  }

  console.log('Payments created:', data)
  return data
}
```

### Example 8: Get Dashboard Statistics

```typescript
import { supabase } from './lib/supabase'

async function getDashboardStats() {
  // Get total payments
  const { data: payments } = await supabase
    .from('payments')
    .select('amount')

  const totalPayments = payments?.reduce((sum, p) => sum + p.amount, 0) || 0

  // Get total investments
  const { data: investments } = await supabase
    .from('investments')
    .select('amount')

  const totalInvestment = investments?.reduce((sum, i) => sum + i.amount, 0) || 0

  // Get shuttle stock
  const { data: shuttleStock } = await supabase
    .from('shuttle_stock')
    .select('*')
    .single()

  // Get total players
  const { count: totalPlayers } = await supabase
    .from('players')
    .select('*', { count: 'exact', head: true })

  return {
    totalPayments,
    currentBalance: totalPayments - totalInvestment,
    totalInvestment,
    totalShuttleStock: shuttleStock?.total_stock || 0,
    remainingShuttleStock: shuttleStock?.remaining || 0,
    totalPlayers: totalPlayers || 0
  }
}
```

## Important Notes

### Security
- The SQL schema includes Row Level Security (RLS) policies that allow all operations
- **In production**, you should:
  1. Implement proper authentication using Supabase Auth
  2. Create restrictive RLS policies
  3. Hash passwords using bcrypt (never store plain text passwords)
  4. Use service role keys only on the server side

### Data Types
- Supabase uses PostgreSQL, so all data types match the SQL schema
- UUIDs are generated automatically
- Timestamps use ISO 8601 format

### Real-time Subscriptions (Optional)

You can subscribe to database changes:

```typescript
import { supabase } from './lib/supabase'

// Subscribe to new payments
const subscription = supabase
  .channel('payments-channel')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'payments' },
    (payload) => {
      console.log('New payment:', payload.new)
    }
  )
  .subscribe()
```

## Next Steps

1. Update all your React components to use Supabase instead of Axios
2. Remove the Express backend (or keep it if you need server-side logic)
3. Implement proper authentication with Supabase Auth
4. Test all CRUD operations
5. Deploy your frontend to Vercel, Netlify, or similar

## Support

For Supabase documentation, visit: [https://supabase.com/docs](https://supabase.com/docs)