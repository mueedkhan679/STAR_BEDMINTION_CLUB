# Fix "Invalid Credentials" Error

## Problem
You're seeing "Invalid credentials" even though the admin user exists in Supabase.

## Root Cause
Row Level Security (RLS) is blocking the query. The updated SQL schema now includes proper permissions.

## Solution: Run Updated SQL in Supabase

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in left sidebar

### Step 2: Clear Old Data (Optional)
Run this to start fresh:

```sql
-- Delete existing admin user
DELETE FROM admin WHERE username = 'yahya';

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations on admin" ON admin;
DROP POLICY IF EXISTS "Allow all operations on players" ON players;
DROP POLICY IF EXISTS "Allow all operations on payments" ON payments;
DROP POLICY IF EXISTS "Allow all operations on investments" ON investments;
DROP POLICY IF EXISTS "Allow all operations on shuttle_stock" ON shuttle_stock;
```

### Step 3: Run the Complete Schema

**Option A: Use the file in your project**
1. Open `supabase-schema.sql` from your project folder
2. Copy ALL contents
3. Paste into Supabase SQL Editor
4. Click **"Run"**

**Option B: Copy and paste this SQL directly**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create admin table
CREATE TABLE IF NOT EXISTS admin (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  father_name TEXT NOT NULL,
  address TEXT NOT NULL,
  email TEXT,
  picture TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  time TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create investments table
CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_type TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  quantity INTEGER,
  date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  time TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create shuttle_stock table
CREATE TABLE IF NOT EXISTS shuttle_stock (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  total_stock INTEGER DEFAULT 0,
  used_stock INTEGER DEFAULT 0,
  remaining INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert default admin user
INSERT INTO admin (username, password) 
VALUES ('yahya', 'yahya123')
ON CONFLICT (username) DO NOTHING;

-- Insert initial shuttle stock
INSERT INTO shuttle_stock (total_stock, used_stock, remaining)
VALUES (0, 0, 0)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shuttle_stock ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations on admin" ON admin FOR ALL USING (true);
CREATE POLICY "Allow all operations on players" ON players FOR ALL USING (true);
CREATE POLICY "Allow all operations on payments" ON payments FOR ALL USING (true);
CREATE POLICY "Allow all operations on investments" ON investments FOR ALL USING (true);
CREATE POLICY "Allow all operations on shuttle_stock" ON shuttle_stock FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON admin TO anon, authenticated;
GRANT ALL ON players TO anon, authenticated;
GRANT ALL ON payments TO anon, authenticated;
GRANT ALL ON investments TO anon, authenticated;
GRANT ALL ON shuttle_stock TO anon, authenticated;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
```

### Step 4: Verify Success
After running, you should see "Success" message.

### Step 5: Test the Query
Run this to verify the admin user exists:

```sql
SELECT username, password FROM admin WHERE username = 'yahya';
```

You should see:
- username: `yahya`
- password: `yahya123`

### Step 6: Test Login
1. Go back to your browser
2. Refresh page (Ctrl+Shift+R)
3. Login with:
   - Username: `yahya`
   - Password: `yahya123`

## If Still Not Working

### Check Browser Console
Press F12 and look for the error message. Share the exact error text.

### Verify Supabase Connection
In the console, you should see:
```
🔐 Attempting login with username: yahya
📊 Supabase response: {data: ..., error: ...}
```

Share what you see after `📊 Supabase response:`.

### Check Supabase Logs
1. In Supabase Dashboard, go to **Logs** → **Postgres Logs**
2. Look for any errors when you try to login
3. Share the error messages

## Quick Test

After running the SQL, try this in Supabase SQL Editor:

```sql
-- This should return the admin user
SELECT * FROM admin;
```

If this returns the user, the database is set up correctly and the issue is with the app configuration.

If this returns an error, the database setup is incomplete.

## Common Issues

1. **"relation 'admin' does not exist"**
   - Tables not created
   - Solution: Run the full SQL schema again

2. **"permission denied for table admin"**
   - RLS blocking access
   - Solution: Make sure you ran the GRANT statements

3. **"No rows returned"**
   - Admin user not created
   - Solution: Run the INSERT statement again

The updated SQL schema should fix the issue. Run it in Supabase and try logging in again.