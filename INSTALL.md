# Installation Guide - Star Badminton Club Management System

## Quick Setup

### Step 1: Install Root Dependencies
```bash
npm install
```

### Step 2: Install Server Dependencies
```bash
cd server
npm install
cd ..
```

### Step 3: Install Client Dependencies
```bash
cd client
npm install
cd ..
```

### Step 4: Setup PostgreSQL Database

1. Make sure PostgreSQL is installed and running
2. Create a database named `star_badminton_db`
3. Update the `DATABASE_URL` in `server/.env` if needed (default is: `postgresql://postgres:postgres@localhost:5432/star_badminton_db`)

### Step 5: Initialize Database Schema
```bash
cd server
npx prisma db push
cd ..
```

### Step 6: Seed Database (Optional - Creates Default Admin)
```bash
cd server
node prisma/seed.js
cd ..
```

### Step 7: Start the Application
```bash
npm run dev
```

This will start:
- **Backend Server**: http://localhost:5000
- **Frontend Application**: http://localhost:3000

## Default Login Credentials

- **Username**: `yahya`
- **Password**: `yahya123`

## Alternative: Use Setup Script (Windows)

Double-click `setup.bat` to automatically install all dependencies.

## Manual Installation (If Script Fails)

If you encounter any issues, install dependencies manually:

```bash
# Root
npm install

# Server
cd server
npm install
cd ..

# Client  
cd client
npm install
cd ..
```

## Troubleshooting

### TypeScript Errors
The TypeScript errors you see in VS Code are normal before installing dependencies. After running `npm install` in both `server` and `client` directories, these errors will be resolved.

### Port Already in Use
If ports 3000 or 5000 are already in use, you can modify:
- Frontend port: `client/vite.config.ts` (line 4)
- Backend port: `server/.env` (PORT variable)

### Database Connection Issues
1. Verify PostgreSQL is running
2. Check database credentials in `server/.env`
3. Ensure database `star_badminton_db` exists

## Project Structure

```
STAR-project/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Express Backend
│   ├── src/
│   │   ├── config/        # Database config
│   │   ├── middleware/    # Auth middleware
│   │   ├── routes/        # API routes
│   │   └── index.js       # Server entry
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── seed.js        # Database seeder
│   ├── package.json
│   └── .env
├── package.json           # Root package
├── setup.bat             # Windows setup script
└── README.md             # Documentation
```

## Next Steps After Installation

1. Open http://localhost:3000 in your browser
2. Login with credentials: `yahya` / `yahya123`
3. Start managing your badminton club!

## Features Available

✅ Dashboard with real-time statistics
✅ Player management (add, edit, delete, search)
✅ Payment management (single/multiple/all players)
✅ Investment/expense tracking
✅ Shuttle stock management
✅ Records with PDF export
✅ Responsive design (mobile/tablet/desktop)
✅ Dark mode support
✅ Premium UI with animations

## Support

For issues or questions, refer to the README.md file.