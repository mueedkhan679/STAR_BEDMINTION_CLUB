# Visual Guide: How to Fix RLS Policy Error (Step-by-Step with Screenshots)

## The Problem
You're getting "new row violates row-level security policy" error when uploading files.

## The Solution
Follow this EXACT process in Supabase Dashboard:

---

## STEP 1: Open Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Login to your account
3. Click on your project (STAR Bedminton Club)

---

## STEP 2: Navigate to Storage

1. Look at the **LEFT SIDEBAR**
2. Find and click **"Storage"** (icon looks like a folder)
3. You'll see a list of buckets (or empty state)

---

## STEP 3: Create the Media Bucket

### If you don't have a 'media' bucket yet:

1. Click the **"New bucket"** button (top right)
2. Fill in the form:
   ```
   Name: media
   Public bucket: [TOGGLE ON - make sure it's green]
   File size limit: 50 MB
   Allowed MIME types: (leave empty or add the ones listed below)
   ```
3. Click **"Create bucket"**

### Allowed MIME types (add these if the field exists):
- image/jpeg
- image/png
- image/gif
- image/webp
- video/mp4
- video/webm

---

## STEP 4: Open the Media Bucket

1. Click on the **"media"** bucket in the list
2. You'll see bucket details
3. Click the **"Policies"** tab (at the top)

---

## STEP 5: DELETE All Existing Policies

**CRITICAL**: Start fresh to avoid conflicts.

1. You'll see a list of policies (if any)
2. For EACH policy:
   - Click the **three dots (⋮)** on the right side
   - Click **"Delete policy"**
   - Confirm deletion
3. Delete ALL policies until the list is empty

---

## STEP 6: Create Policy #1 - Public Read Access

1. Click **"New policy"** button
2. You'll see a form with several sections:

### Section: Policy Name
```
Enter: Public can view media
```

### Section: Allowed Operation
- You'll see checkboxes: SELECT, INSERT, UPDATE, DELETE
- **Check ONLY**: `SELECT` (uncheck all others)
- Leave others unchecked

### Section: Target Roles
- You'll see checkboxes: anon, authenticated
- **Check BOTH**: `anon` and `authenticated`

### Section: Policy Definition
You have TWO options here:

#### Option A: Using Visual Builder (EASIER - RECOMMENDED)
1. Look for a dropdown or button that says **"Use visual builder"** or similar
2. If you see a visual interface with fields:
   - Field: Select `bucket_id`
   - Operation: Select `=`
   - Value: Type `media`
3. It should show: `bucket_id = 'media'`

#### Option B: Using SQL (if visual builder not available)
- Find a text area that says "Policy definition" or "SQL"
- Type exactly:
  ```sql
  bucket_id = 'media'
  ```

### Final Check:
- Policy name: `Public can view media`
- Allowed operation: ✅ SELECT only
- Target roles: ✅ anon, authenticated
- Policy definition: `bucket_id = 'media'`

3. Click **"Review"** button
4. Review the policy
5. Click **"Save policy"**

---

## STEP 7: Create Policy #2 - Authenticated Upload (MOST IMPORTANT)

**This is the policy that fixes your error.**

1. Click **"New policy"** button again

### Section: Policy Name
```
Enter: Authenticated users can upload
```

### Section: Allowed Operation
- **Check ONLY**: `INSERT` (uncheck SELECT, UPDATE, DELETE)

### Section: Target Roles
- **Check ONLY**: `authenticated` (uncheck anon)

### Section: Policy Definition

#### Option A: Visual Builder (EASIER)
1. Click "Use visual builder" if available
2. Set:
   - Field: `bucket_id`
   - Operation: `=`
   - Value: `media`

#### Option B: SQL
Type exactly:
```sql
bucket_id = 'media'
```

### ⚠️ CRITICAL CHECK - DO NOT SKIP:
Look for a toggle switch labeled **"Enable policy"** or similar:
- It MUST be turned **ON** (green)
- If it's OFF (gray), the policy won't work!

### Final Check:
- Policy name: `Authenticated users can upload`
- Allowed operation: ✅ INSERT only
- Target roles: ✅ authenticated only
- Policy definition: `bucket_id = 'media'`
- **Enable policy: ✅ ON (GREEN)**

3. Click **"Review"**
4. Click **"Save policy"**

---

## STEP 8: Create Policy #3 - Authenticated Update

1. Click **"New policy"**

### Fill in:
- Policy name: `Authenticated users can update`
- Allowed operation: ✅ UPDATE only
- Target roles: ✅ authenticated only
- Policy definition: `bucket_id = 'media'`
- Enable policy: ✅ ON

2. Click "Review" → "Save policy"

---

## STEP 9: Create Policy #4 - Authenticated Delete

1. Click **"New policy"**

### Fill in:
- Policy name: `Authenticated users can delete`
- Allowed operation: ✅ DELETE only
- Target roles: ✅ authenticated only
- Policy definition: `bucket_id = 'media'`
- Enable policy: ✅ ON

2. Click "Review" → "Save policy"

---

## STEP 10: Verify All Policies

You should now see 4 policies in the list:

1. ✅ **Public can view media** - SELECT - anon, authenticated
2. ✅ **Authenticated users can upload** - INSERT - authenticated
3. ✅ **Authenticated users can update** - UPDATE - authenticated
4. ✅ **Authenticated users can delete** - DELETE - authenticated

**Important**: Each policy should have a GREEN toggle next to it (enabled).

---

## STEP 11: Verify Bucket is Public

1. Go back to **"Configuration"** tab (next to Policies)
2. Check:
   - **Public bucket**: ✅ TOGGLED ON (green)
   - **File size limit**: 50 MB or higher
   - **Allowed MIME types**: Should include image and video types

---

## STEP 12: Test the Upload

1. **Clear browser cache**: Press Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Logout** from admin portal
3. **Login again** to admin portal
4. Go to **Website Management**
5. Click **"Add Media"**
6. Select a small image file (< 1MB)
7. Add caption: "Test"
8. Add date: Today
9. Click **"Add Media"**

---

## Common Mistakes to Avoid:

### ❌ Mistake 1: Policy toggle is OFF
**Problem**: Policy exists but is disabled
**Fix**: Make sure the toggle next to policy name is GREEN (ON)

### ❌ Mistake 2: Wrong role selected
**Problem**: INSERT policy has "anon" instead of "authenticated"
**Fix**: Only check "authenticated" for INSERT/UPDATE/DELETE policies

### ❌ Mistake 3: Multiple operations selected
**Problem**: INSERT policy also has SELECT checked
**Fix**: Each policy should have ONLY ONE operation checked

### ❌ Mistake 4: Bucket not public
**Problem**: Public bucket toggle is OFF
**Fix**: Go to Configuration and toggle Public bucket ON

### ❌ Mistake 5: Not logged in
**Problem**: User is not authenticated
**Fix**: Logout and login again to admin portal

### ❌ Mistake 6: Browser cache
**Problem**: Old policies cached
**Fix**: Clear cache with Ctrl+Shift+R

---

## Debugging: Check if You're Logged In

1. Open your admin portal
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Type this and press Enter:
   ```javascript
   const { supabase } = await import('./lib/supabase')
   const { data: { user } } = await supabase.auth.getUser()
   console.log('User:', user)
   ```

5. **If you see user data**: You're logged in ✅
6. **If you see null**: You're NOT logged in ❌
   - Logout and login again

---

## Still Not Working? Nuclear Option:

### Option 1: Disable RLS Temporarily (For Testing Only)

1. Go to Supabase Dashboard
2. Click **SQL Editor** (in left sidebar)
3. Paste this SQL:
   ```sql
   ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
   ```
4. Click **"Run"**
5. Try uploading again

**If this works**: The problem is definitely with your RLS policies. Re-enable RLS and recreate policies carefully.

**To re-enable RLS**:
```sql
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

### Option 2: Delete and Recreate Everything

1. Delete the 'media' bucket completely
2. Create a new bucket named 'media'
3. Set it to public
4. Follow steps 6-9 again very carefully
5. Test upload

---

## Visual Checklist:

After setup, verify:

- [ ] Bucket name is exactly `media` (lowercase)
- [ ] Bucket is Public (toggle ON)
- [ ] 4 policies exist in Policies tab
- [ ] Each policy has GREEN toggle (enabled)
- [ ] INSERT policy has only "authenticated" role
- [ ] You're logged in to admin portal
- [ ] Browser cache cleared
- [ ] Tested with small image file

---

## Contact Support

If still not working:
1. Take screenshots of your policies tab
2. Copy the exact error from browser console
3. Check Supabase status page
4. Contact Supabase support with screenshots

---

## Summary

The error happens because:
1. RLS policy for INSERT is missing or disabled
2. User is not authenticated
3. Bucket is not public
4. Policy has wrong configuration

**Most common fix**: Delete all policies and recreate them following this guide EXACTLY, making sure the INSERT policy for authenticated users is ENABLED (green toggle).