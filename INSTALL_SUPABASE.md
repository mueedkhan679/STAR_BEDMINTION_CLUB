# Install Supabase Package - Quick Fix

## Problem
The console shows:
```
⚠️ Using mock Supabase - install @supabase/supabase-js and configure .env
❌ Supabase error: {message: 'Supabase not initialized'}
```

This means the `@supabase/supabase-js` package is **not installed**.

## Solution: Install the Package

### Step 1: Stop the Dev Server
Press **Ctrl+C** in the terminal where the dev server is running.

### Step 2: Install Supabase Package
```bash
cd client
npm install @supabase/supabase-js
```

### Step 3: Wait for Installation
You should see output like:
```
added 1 package in 2s
```

### Step 4: Verify Installation
```bash
npm list @supabase/supabase-js
```

Expected output:
```
@supabase/supabase-js@2.39.0
```

### Step 5: Restart Dev Server
```bash
npm run dev
```

### Step 6: Hard Refresh Browser
Press **Ctrl+Shift+R** (Windows/Linux) or **Cmd+Shift+R** (Mac)

### Step 7: Test Login
- Username: `yahya`
- Password: `yahya123`

## Expected Result

After installation, the console should show:
```
✅ Supabase client initialized
🔐 Attempting login with username: yahya
📊 Supabase response: {data: {...}, error: null}
✅ Found admin: yahya
```

Instead of the mock warning.

## If Installation Fails

### Clear Cache and Reinstall
```bash
cd client
rm -rf node_modules package-lock.json
npm install
npm install @supabase/supabase-js
npm run dev
```

### Check for Errors
If you see errors during installation, share the error message.

## Verify .env File

Make sure `client/.env` exists with:
```env
VITE_SUPABASE_URL=https://gcxnjfnysfferzlqcdut.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_eQ_Q20j1wR9oAlXK7YOWdw_0fwTuy5p
```

## Quick One-Liner

Run this entire sequence:
```bash
cd client && npm install @supabase/supabase-js && npm run dev
```

Then hard refresh your browser and login with `yahya` / `yahya123`.

The app should work after installing the Supabase package!