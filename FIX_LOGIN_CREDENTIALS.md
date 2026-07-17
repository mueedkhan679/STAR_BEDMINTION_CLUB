# Fix Login Credentials Issue

## 🔐 Problem: "Invalid credentials" After Deployment

If you're getting "Invalid credentials" error after deploying to Vercel, it's because the password in your Supabase database is hashed, but the login code compares plain text.

## ✅ Solution: Update Admin Password in Database

### Option 1: Using Supabase SQL Editor (Recommended)

1. **Go to Supabase Dashboard**:
   - Visit https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**:
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run this SQL command**:
```sql
-- Update admin password to plain text (to match login comparison)
UPDATE admin 
SET password = 'yahya123' 
WHERE username = 'yahya';
```

4. **Click "Run"** to execute the query

5. **Verify the update**:
```sql
-- Check if password was updated
SELECT username, password FROM admin WHERE username = 'yahya';
```

You should see:
```
username: yahya
password: yahya123
```

### Option 2: Using Supabase Table Editor

1. **Go to Supabase Dashboard**
2. **Click "Table Editor"** in left sidebar
3. **Select "admin" table**
4. **Find the row** with username = 'yahya'
5. **Click "Edit"** on that row
6. **Change password field** to: `yahya123`
7. **Click "Save"**

### Option 3: Delete and Re-seed (Nuclear Option)

If the above doesn't work, you can delete the admin and re-create it:

```sql
-- Delete existing admin
DELETE FROM admin WHERE username = 'yahya';

-- Insert new admin with plain text password
INSERT INTO admin (username, password) 
VALUES ('yahya', 'yahya123');
```

## 🔍 Why This Happened

### The Issue:
1. **Old seed.js** used bcrypt to hash the password:
   ```javascript
   const hashedPassword = await bcrypt.hash('yahya123', 10)
   // Stored: $2a$10$abc123... (hashed)
   ```

2. **Login.tsx** compares plain text:
   ```javascript
   if (admin.password === password) {
   // Compares: "$2a$10$abc123..." === "yahya123"
   // Result: false ❌
   ```

3. **New seed.js** uses plain text:
   ```javascript
   password: 'yahya123' // Plain text
   ```

### The Fix:
- Updated `seed.js` to use plain text password
- Now you need to update the existing database record

## ✅ After Fixing

1. **Try logging in again**:
   - Username: `yahya`
   - Password: `yahya123`

2. **Should work now!** ✅

## 🛡️ For Production (Security Best Practice)

For better security, you should use password hashing. Here's how:

### Update Login.tsx to use bcrypt:

```typescript
// Add this import at the top
import bcrypt from 'bcryptjs'

// In handleSubmit, replace the password check with:
const isPasswordValid = await bcrypt.compare(password, admin.password)

if (isPasswordValid) {
  localStorage.setItem('user', JSON.stringify(admin))
  toast.success('Login successful!')
  onLogin(admin)
} else {
  toast.error('Invalid credentials')
}
```

### Then update seed.js back to hashing:

```typescript
import bcrypt from 'bcryptjs'

const hashedPassword = await bcrypt.hash('yahya123', 10)

const admin = await prisma.admin.upsert({
  where: { username: 'yahya },
  update: {},
  create: {
    username: 'yahya',
    password: hashedPassword,
  },
})
```

## 📝 Quick Fix Summary

**For immediate fix** (less secure but works):
```sql
UPDATE admin SET password = 'yahya123' WHERE username = 'yahya';
```

**For production** (more secure):
- Use bcrypt in login code
- Keep hashed passwords in database

## 🆘 Still Not Working?

### Check browser console for errors:
1. Press F12 to open DevTools
2. Go to "Console" tab
3. Try logging in
4. Look for error messages

### Check Supabase logs:
1. Go to Supabase Dashboard
2. Click "Logs" → "Postgres Logs"
3. Look for the login query
4. Check if it's returning data

### Verify database connection:
1. Check `client/.env` has correct Supabase credentials
2. Check `server/.env` has correct database URL
3. Make sure Supabase project is active

## 📞 Need More Help?

Check these files:
- `FIX_LOGIN.md` - General login troubleshooting
- `SUPABASE_SETUP.md` - Supabase configuration
- `TROUBLESHOOTING.md` - Common issues

---

**After running the SQL command, your login should work!** 🎉