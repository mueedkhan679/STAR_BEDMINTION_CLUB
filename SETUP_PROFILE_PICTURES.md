# Setup Profile Pictures - Step by Step Guide

## Error You're Seeing:
```
Could not find the 'director_profile_url' column of 'website_content' in the schema cache
```

This means the database columns haven't been created yet. Follow these steps:

## Step 1: Run the SQL Migration

### Option A: Using Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com
   - Login to your account
   - Select your project

2. **Open SQL Editor**
   - Click on **SQL Editor** in the left sidebar
   - Click **New Query**

3. **Copy and Paste the SQL**
   - Open the file: `supabase-schema-website-updated.sql`
   - Copy ALL the content from that file
   - Paste it into the Supabase SQL Editor

4. **Run the Query**
   - Click the **RUN** button (or press Ctrl+Enter)
   - You should see: `Profile picture columns added successfully!`

### Option B: Using Supabase CLI

```bash
# Navigate to your project directory
cd d:/STAR-project

# Run the SQL file
supabase db execute --file supabase-schema-website-updated.sql
```

## Step 2: Verify the Columns Were Added

1. In Supabase Dashboard, go to **Table Editor**
2. Select the **website_content** table
3. You should now see these new columns:
   - `director_profile_url` (type: TEXT)
   - `manager_profile_url` (type: TEXT)

## Step 3: Test the Application

1. **Restart your development server** (if running):
   ```bash
   npm run dev
   ```

2. **Test Admin Panel**:
   - Go to http://localhost:5173/website-management
   - Click on "Manager & Director" tab
   - Click "Edit"
   - Scroll down to "Profile Pictures" section
   - You should see two upload sections:
     - Manager Profile Picture
     - Director Profile Picture

3. **Upload a Test Picture**:
   - Click "Upload Photo" for Manager
   - Select an image file
   - It should upload and show a preview
   - Repeat for Director

4. **View Public Website**:
   - Go to http://localhost:5173/public-website
   - Scroll down to "Club Leadership" section
   - You should see the profile pictures displayed

## Troubleshooting

### If you still see the error:

1. **Clear Supabase Cache**:
   - In Supabase Dashboard, go to **Settings** → **API**
   - Scroll down and click **Reset Cache**
   - Wait 30 seconds
   - Try again

2. **Check RLS Policies**:
   - Make sure you've run the RLS fix SQL files:
     - `fix-website-content-rls.sql`
     - `fix-media-posts-rls.sql`

3. **Verify Table Structure**:
   ```sql
   -- Run this in SQL Editor to check
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'website_content'
   AND column_name IN ('director_profile_url', 'manager_profile_url');
   ```

   You should see both columns listed.

### If columns don't appear:

Run this SQL directly in the Supabase SQL Editor:

```sql
-- Add profile picture columns
ALTER TABLE website_content 
ADD COLUMN IF NOT EXISTS director_profile_url TEXT,
ADD COLUMN IF NOT EXISTS manager_profile_url TEXT;

-- Verify
SELECT * FROM website_content LIMIT 1;
```

## Step 4: Complete Setup

Once the columns are added:

1. ✅ Database schema updated
2. ✅ Admin panel ready for uploads
3. ✅ Public website ready to display
4. ✅ Profile pictures working

## What Each Part Does:

### Database (Supabase):
- Stores profile pictures as base64 strings
- Columns: `director_profile_url`, `manager_profile_url`

### Admin Panel (WebsiteManagement.tsx):
- Upload interface for profile pictures
- Converts images to base64
- Saves to database
- Shows preview

### Public Website (PublicWebsite.tsx):
- Displays profile pictures in "Club Leadership" section
- Shows fallback avatar if no picture uploaded
- Smooth animations and hover effects

## Need Help?

If you encounter any issues:
1. Check the browser console for errors
2. Check Supabase logs in Dashboard
3. Verify the SQL ran successfully
4. Make sure RLS policies allow updates

## Success Checklist:

- [ ] SQL migration ran successfully
- [ ] Columns visible in Supabase Table Editor
- [ ] No more "column not found" errors
- [ ] Admin panel shows profile picture upload section
- [ ] Can upload Manager profile picture
- [ ] Can upload Director profile picture
- [ ] Public website displays profile pictures
- [ ] Hover animations work on profile cards

---

**Important**: You MUST run the SQL file before the application will work!