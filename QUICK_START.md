# Quick Start Guide - Supabase Version

## Prerequisites
- Node.js installed
- A Supabase account (sign up at https://supabase.com)

## 5-Minute Setup

### 1. Create Supabase Project
- Go to https://supabase.com and create a new project
- Wait for it to be ready (~2 minutes)

### 2. Setup Database
1. In Supabase dashboard, go to **SQL Editor**
2. Click **New query**
3. Copy-paste the contents of `supabase-schema.sql`
4. Click **Run**
5. Done! All tables are created with default admin user

### 3. Get Credentials
1. In Supabase, go to **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://xyzcompany.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### 4. Configure Frontend
Create `client/.env` file:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Install Dependencies
```bash
cd client
npm install
```

### 6. Run the App
```bash
cd client
npm run dev
```

Open http://localhost:3000

### 7. Login
- Username: `yahya`
- Password: `yahya123`

## That's It!

You now have a fully functional badminton club management system powered by Supabase.

## What's Next?

- Read `SUPABASE_SETUP.md` for detailed documentation
- Read `SUPABASE_MIGRATION.md` to understand how to migrate components
- Customize the UI in `client/src/pages/`
- Add more features as needed

## Need Help?

Check the documentation files:
- `README.md` - Project overview
- `INSTALL.md` - Detailed installation steps
- `SUPABASE_SETUP.md` - Supabase setup and usage examples
- `SUPABASE_MIGRATION.md` - Component migration guide

## Features Available

✅ Dashboard with live statistics
✅ Player management (CRUD operations)
✅ Payment management (single/multiple/all)
✅ Investment/expense tracking
✅ Shuttle stock management
✅ Records with PDF export
✅ Search functionality
✅ Responsive design
✅ Dark mode support
✅ Premium UI with animations