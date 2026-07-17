# Database Setup Guide - Create Admin User

## Current Status
✅ App is loading successfully
✅ Login page is working
❌ Admin user not found in database

## Quick Fix - Create Admin User

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Login to your account
3. Select your project

### Step 2: Open SQL Editor
1. Click **"SQL Editor"** in the left sidebar
2. Click **"New query"** button

### Step 3: Copy and Paste This SQL

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
  player_id UUID NOT NULL,
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

-- Insert default admin user (password: yahya123)
INSERT INTO admin (username, password) 
VALUES ('yahya', 'yahya123')
ON CONFLICT (username) DO NOTHING;

-- Insert initial shuttle stock
INSERT INTO shuttle_stock (total_stock, used_stock, remaining)
VALUES (0, 0, 0)
ON CONFLICT DO NOTHING;
```

### Step 4: Run the SQL
1. Click the **"Run"** button (or press Ctrl+Enter)
2. Wait for "Success" message

### Step 5: Verify Tables Created
1. Click **"Table Editor"** in left sidebar
2. You should see these tables:
   - ✅ admin
   - ✅ players
   - ✅ payments
   - ✅ investments
   - ✅ shuttle_stock

3. Click on **admin** table
4. You should see one row:
   - username: `yahya`
   - password: `yahya123`

## After Database Setup

1. **Go back to your browser**
2. **Refresh the page** (Ctrl+Shift+R)
3. **Login with**:
   - Username: `yahya`
   - Password: `yahya123`
4. You should now see the **Dashboard**

## What You Can Do After Login

✅ View Dashboard with statistics
✅ Add players
✅ Record payments
✅ Track investments/expenses
✅ Manage shuttle stock
✅ View records
✅ Export PDF reports

## Troubleshooting

### "Invalid credentials" error
- Make sure you ran the SQL above
- Check that admin table has the user
- Verify username is exactly: `yahya`
- Verify password is exactly: `yahya123`

### Tables not showing
- Make sure you clicked "Run" in SQL Editor
- Check for error messages in SQL Editor
- Try running the SQL again

### Still can't login
1. Go to Table Editor → admin table
2. Check if user exists
3. If not, run this SQL:
   ```sql
   INSERT INTO admin (username, password) 
   VALUES ('yahya', 'yahya123')
   ON CONFLICT (username) DO NOTHING;
   ```

## Need Help?

If you're still having issues:
1. Check browser console (F12) for errors
2. Verify Supabase credentials in client/.env
3. Make sure all tables are created in Supabase
4. Try logging out and back in

The app is working - you just need to set up the database!