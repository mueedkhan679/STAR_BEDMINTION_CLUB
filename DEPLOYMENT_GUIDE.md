# Star Badminton Club - Deployment Guide

## 🚀 Complete Online Deployment Guide

This guide will help you deploy the Star Badminton Club Management System online for production use.

---

## 📋 Prerequisites

- GitHub account (for code hosting)
- Supabase account (for database) - Already configured
- Groq API key (for voice assistant) - Already configured
- Domain name (optional, can use free subdomains)

---

## 🎯 Recommended Deployment Stack

### Option 1: Full Stack on Supabase (Easiest)
- **Frontend**: Vercel or Netlify (free)
- **Backend**: Supabase Edge Functions (free tier)
- **Database**: Supabase PostgreSQL (already configured)
- **Total Cost**: $0/month (free tier)

### Option 2: Full Stack on Railway
- **Frontend**: Vercel or Netlify
- **Backend**: Railway.app ($5/month)
- **Database**: Supabase PostgreSQL
- **Total Cost**: $5/month

### Option 3: Complete Separation
- **Frontend**: Vercel/Netlify (free)
- **Backend**: Render.com (free tier)
- **Database**: Supabase PostgreSQL (free)
- **Total Cost**: $0/month

---

## 🗄️ Step 1: Database Setup (Supabase)

### Already Configured! ✅
Your database is already set up on Supabase. Just ensure:
1. All tables are created (players, payments, investments, shuttle_stock, admins)
2. RLS policies are configured
3. Database credentials are ready

### Get Supabase Credentials:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy:
   - Project URL
   - anon/public key
   - service_role key (keep this secret!)

---

## 🎨 Step 2: Deploy Frontend (Vercel - Recommended)

### Method A: Deploy via Vercel Dashboard

1. **Push Code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/star-badminton-club.git
   git push -u origin main
   ```

2. **Deploy on Vercel**:
   - Go to https://vercel.com
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository
   - **Important Configuration**:
     - **Root Directory**: `client` (IMPORTANT!)
     - **Framework Preset**: Vite
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   
3. **Environment Variables** (in Vercel):
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Deploy**: Click "Deploy" button

**Note**: Setting "Root Directory" to `client` is critical! This ensures Vercel installs dependencies from the correct package.json where vite is installed.

### Method B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to client folder
cd client

# Deploy
vercel

# Follow prompts and add environment variables
```

---

## ⚙️ Step 3: Deploy Backend (Railway - Recommended)

### Option A: Deploy on Railway

1. **Push Code to GitHub** (if not already done)

2. **Deploy on Railway**:
   - Go to https://railway.app
   - Sign in with GitHub
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select the `server` folder as root

3. **Environment Variables** (in Railway):
   ```
   DATABASE_URL=your_supabase_database_connection_string
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=production
   PORT=3001
   ```

4. **Deploy**: Railway will automatically deploy

### Option B: Deploy on Render

1. Go to https://render.com
2. Sign in with GitHub
3. Click "New" → "Web Service"
4. Connect your repository
5. Configure:
   - **Name**: star-badminton-backend
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
6. Add environment variables
7. Click "Create Web Service"

---

## 🔧 Step 4: Configure Environment Variables

### Frontend (.env in client folder)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Backend (.env in server folder)
```env
# Database
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project.supabase.co:5432/postgres

# JWT
JWT_SECRET=your_very_secure_jwt_secret_key_here

# Server
PORT=3001
NODE_ENV=production

# CORS (your frontend URL)
CORS_ORIGIN=https://your-app.vercel.app
```

---

## 🗄️ Step 5: Database Migration

### Run Prisma Migrations:

1. **Local Migration**:
   ```bash
   cd server
   npx prisma migrate deploy
   npx prisma db seed
   ```

2. **Production Database**:
   - Connect to your Supabase database
   - Run migrations:
   ```bash
   # Set DATABASE_URL to production
   export DATABASE_URL=your_production_database_url
   
   # Run migrations
   npx prisma migrate deploy
   
   # Seed admin user
   npx prisma db seed
   ```

### Seed Admin User:
```javascript
// server/prisma/seed.js
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('yahya123', 10)
  
  await prisma.admin.upsert({
    where: { username: 'yahya' },
    update: {},
    create: {
      username: 'yahya',
      password: hashedPassword,
    },
  })
  
  console.log('Admin user created: yahya / yahya123')
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
```

Run: `npx prisma db seed`

---

## 🌐 Step 6: Configure Custom Domain (Optional)

### For Vercel (Frontend):
1. Go to Vercel Dashboard → Your Project
2. Click "Settings" → "Domains"
3. Add your custom domain (e.g., `starbadminton.com`)
4. Update DNS records as instructed
5. SSL certificate will be auto-generated

### For Railway (Backend):
1. Go to Railway Dashboard → Your Project
2. Click "Settings" → "Domains"
3. Add custom domain (e.g., `api.starbadminton.com`)
4. Update DNS records
5. SSL certificate will be auto-generated

---

## 🔒 Step 7: Security Checklist

### Before Going Live:

- [ ] Change default admin password
- [ ] Use strong JWT_SECRET (min 32 characters)
- [ ] Enable HTTPS (automatic with Vercel/Railway)
- [ ] Configure CORS properly (only allow your domain)
- [ ] Set NODE_ENV=production
- [ ] Enable Supabase RLS policies
- [ ] Use environment variables (never hardcode secrets)
- [ ] Enable rate limiting on backend
- [ ] Regular database backups (Supabase auto-backup)

---

## 📊 Step 8: Testing Production

### Test Checklist:

1. **Authentication**:
   - [ ] Login with admin credentials
   - [ ] JWT token expiration works
   - [ ] Logout functionality

2. **Player Management**:
   - [ ] Add new player
   - [ ] Edit player
   - [ ] Delete player
   - [ ] Player code generation

3. **Payment Management**:
   - [ ] Add payment (single player)
   - [ ] Add payment (multiple players)
   - [ ] Add payment (all players)
   - [ ] Installment tracking

4. **Investment Management**:
   - [ ] Add investment
   - [ ] Shuttle stock updates
   - [ ] Expense tracking

5. **PDF Export**:
   - [ ] Generate payment PDF
   - [ ] Generate investment PDF
   - [ ] Installment selection works

6. **Voice Assistant**:
   - [ ] Voice recognition works
   - [ ] Groq API integration
   - [ ] Bilingual support (English/Urdu)

7. **Responsive Design**:
   - [ ] Mobile view
   - [ ] Tablet view
   - [ ] Desktop view
   - [ ] Dark mode toggle

---

## 🚀 Step 9: Go Live!

### Final Steps:

1. **Update DNS** (if using custom domain):
   - Point domain to Vercel (frontend)
   - Point API subdomain to Railway (backend)

2. **Update CORS** in backend:
   ```env
   CORS_ORIGIN=https://your-custom-domain.com
   ```

3. **Test Everything**:
   - Visit your live URL
   - Test all features
   - Check mobile responsiveness

4. **Share with Users**:
   - Send login credentials
   - Provide user guide
   - Share mobile/desktop links

---

## 📈 Step 10: Monitoring & Maintenance

### Free Monitoring Tools:

1. **Vercel Analytics** (Frontend):
   - Page views
   - Performance metrics
   - Error tracking

2. **Railway Metrics** (Backend):
   - CPU/Memory usage
   - Request logs
   - Error rates

3. **Supabase Dashboard** (Database):
   - Database size
   - Query performance
   - API usage

### Regular Maintenance:

- **Weekly**: Check error logs
- **Monthly**: Review database size
- **Quarterly**: Update dependencies
- **As Needed**: Backup database

---

## 💰 Cost Breakdown

### Free Tier (Perfect for Small Clubs):
- **Vercel**: Free (frontend hosting)
- **Railway**: $5/month (backend) OR use Render free tier
- **Supabase**: Free (database + auth)
- **Groq**: Free (voice assistant)
- **Total**: $0-5/month

### Paid Tier (For Growing Clubs):
- **Vercel Pro**: $20/month (if needed)
- **Railway**: $5-20/month
- **Supabase Pro**: $25/month (if needed)
- **Total**: $30-50/month

---

## 🆘 Troubleshooting

### Common Issues:

1. **Build Error: `tsc: command not found`**:
   - **Solution**: Already fixed! The build script now uses `vite build` instead of `tsc && vite build`
   - Vite handles TypeScript compilation directly
   - No need for global TypeScript installation

2. **CORS Errors**:
   - Check CORS_ORIGIN in backend .env
   - Ensure frontend URL is correct

3. **Database Connection**:
   - Verify DATABASE_URL is correct
   - Check Supabase project is active
   - Ensure IP whitelist includes Railway/Render

4. **Build Failures**:
   - Check Node.js version (use 18+)
   - Clear cache and rebuild
   - Check for TypeScript errors in code

5. **PDF Not Generating**:
   - Verify jsPDF is installed
   - Check browser console for errors
   - Ensure CORS allows PDF generation

---

## 📞 Support

### Resources:
- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Supabase Docs**: https://supabase.com/docs
- **Prisma Docs**: https://prisma.io/docs

### Deployment Checklist:
- [ ] Code pushed to GitHub
- [ ] Frontend deployed on Vercel
- [ ] Backend deployed on Railway/Render
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Admin user seeded
- [ ] Custom domain configured (optional)
- [ ] SSL certificates active
- [ ] All features tested
- [ ] Monitoring enabled

---

## 🎉 Congratulations!

Your Star Badminton Club Management System is now **LIVE** and accessible worldwide!

**Next Steps**:
1. Share the URL with your team
2. Train users on the system
3. Monitor usage and performance
4. Collect feedback for improvements

---

## 🔄 Continuous Deployment

### Auto-Deploy Setup:

**Vercel** (Frontend):
- Automatically deploys on every push to main branch
- Preview deployments for pull requests
- Rollback to previous versions

**Railway** (Backend):
- Automatically deploys on every push
- Zero-downtime deployments
- Easy rollbacks

**Best Practice**:
1. Create a `staging` branch for testing
2. Merge to `main` only after testing
3. Use preview deployments for QA
4. Production deploys automatically from main

---

## 📱 Mobile App (Optional)

### Convert to Mobile App:

1. **PWA (Progressive Web App)**:
   - Add manifest.json
   - Enable service workers
   - Install on home screen

2. **Capacitor** (Native App):
   ```bash
   npm install @capacitor/core @capacitor/cli
   npx cap init
   npx cap add android
   npx cap add ios
   ```

3. **Deploy to App Stores**:
   - Google Play Store
   - Apple App Store

---

**Your Star Badminton Club Management System is now ready for the world!** 🏸🌍