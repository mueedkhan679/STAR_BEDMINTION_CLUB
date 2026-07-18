# RLS Policy Debug Guide for Supabase Storage

## Problem
"new row violates row-level security policy" error when uploading to 'media' bucket.

## Root Cause
The RLS policy is not properly configured for Supabase Storage. Storage policies work differently than regular table policies.

## Solution: Complete Step-by-Step Fix

### Step 1: Delete ALL Existing Policies

1. Go to Supabase Dashboard → Storage → media bucket → Policies
2. **DELETE all existing policies** (both SELECT, INSERT, UPDATE, DELETE)
3. Start fresh to avoid conflicts

### Step 2: Create Correct Policies (Use This Exact Method)

#### Policy 1: Public Read Access (SELECT)
1. Click "New policy"
2. Select "For full customization"
3. Fill in:
   - **Policy name**: `Public can view media`
   - **Allowed operation**: Check ONLY `SELECT`
   - **Target roles**: Check `anon` and `authenticated`
4. **Policy definition**: Use visual builder
   - Field: `bucket_id`
   - Operation: `=`
   - Value: `media`
5. Click "Review" → "Save policy"

#### Policy 2: Authenticated Upload (INSERT) - MOST IMPORTANT
1. Click "New policy"
2. Select "For full customization"
3. Fill in:
   - **Policy name**: `Authenticated users can upload`
   - **Allowed operation**: Check ONLY `INSERT`
   - **Target roles**: Check ONLY `authenticated`
4. **Policy definition**: Use visual builder
   - Field: `bucket_id`
   - Operation: `=`
   - Value: `media`
5. **CRITICAL**: Make sure "Enable policy" toggle is ON (green)
6. Click "Review" → "Save policy"

#### Policy 3: Authenticated Update (UPDATE)
1. Click "New policy"
2. Select "For full customization"
3. Fill in:
   - **Policy name**: `Authenticated users can update`
   - **Allowed operation**: Check ONLY `UPDATE`
   - **Target roles**: Check ONLY `authenticated`
4. **Policy definition**: Use visual builder
   - Field: `bucket_id`
   - Operation: `=`
   - Value: `media`
5. Click "Review" → "Save policy"

#### Policy 4: Authenticated Delete (DELETE)
1. Click "New policy"
2. Select "For full customization"
3. Fill in:
   - **Policy name**: `Authenticated users can delete`
   - **Allowed operation**: Check ONLY `DELETE`
   - **Target roles**: Check ONLY `authenticated`
4. **Policy definition**: Use visual builder
   - Field: `bucket_id`
   - Operation: `=`
   - Value: `media`
5. Click "Review" → "Save policy"

### Step 3: Verify Bucket Settings

1. Go to Storage → media bucket → Configuration
2. **Public bucket**: Must be ON (toggle enabled)
3. **File size limit**: Set to 50MB or higher
4. **Allowed MIME types**: Add these:
   - image/jpeg
   - image/png
   - image/gif
   - image/webp
   - video/mp4
   - video/webm

### Step 4: Check Authentication Status

The error often occurs because the user is not properly authenticated:

1. **Open Browser Console** (F12)
2. **Check for auth errors**:
   ```javascript
   // Run this in console
   const { supabase } = await import('./lib/supabase')
   const { data: { user } } = await supabase.auth.getUser()
   console.log('Current user:', user)
   ```
   
3. **If user is null**: You're not logged in
   - Logout and login again
   - Clear browser cache
   - Check if session is expired

### Step 5: Debug Upload with Console Logs

Add this debug code to see exactly what's happening:

```javascript
// In browser console, run this before upload:
const { supabase } = await import('./lib/supabase')

// Check current session
const { data: { session } } = await supabase.auth.getSession()
console.log('Session:', session)

// Check if bucket exists
const { data: buckets } = await supabase.storage.listBuckets()
console.log('Buckets:', buckets)

// Try a test upload
const testFile = new File(['test'], 'test.txt', { type: 'text/plain' })
const { data, error } = await supabase.storage
  .from('media')
  .upload(`test_${Date.now()}.txt`, testFile)

console.log('Upload result:', { data, error })
```

### Step 6: Alternative - Use Permissive Policy (For Testing Only)

If the above doesn't work, create a permissive policy to test:

1. Click "New policy"
2. Select "For full customization"
3. Fill in:
   - **Policy name**: `Allow all authenticated (TESTING)`
   - **Allowed operation**: Check ALL (SELECT, INSERT, UPDATE, DELETE)
   - **Target roles**: Check `authenticated`
4. **Policy definition**: Enter `true` (allows everything)
5. Click "Review" → "Save policy"

**WARNING**: This is less secure but helps diagnose if the issue is with the policy condition.

### Step 7: Check Supabase Logs

1. Go to Supabase Dashboard → Logs
2. Filter by "Storage"
3. Look for the exact error message
4. Check if it mentions:
   - "policy violation"
   - "not authenticated"
   - "bucket not found"

## Common Issues and Fixes

### Issue 1: "Policy not enabled"
**Fix**: Make sure the toggle next to policy name is ON (green)

### Issue 2: "User not authenticated"
**Fix**: 
- Logout and login again
- Check if JWT token is valid
- Clear localStorage and try again

### Issue 3: "Bucket not public"
**Fix**: 
- Go to bucket settings
- Toggle "Public bucket" to ON
- Save changes

### Issue 4: "Wrong bucket name"
**Fix**: 
- Bucket name must be exactly `media` (lowercase)
- Check for typos in code

### Issue 5: "Storage schema issue"
**Fix**: Run this SQL in Supabase SQL Editor:

```sql
-- Grant necessary permissions
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA storage TO authenticated;

-- Ensure RLS is enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

## Quick Diagnostic Checklist

- [ ] Bucket name is exactly `media` (lowercase)
- [ ] Bucket is set to Public
- [ ] All 4 policies are created (SELECT, INSERT, UPDATE, DELETE)
- [ ] INSERT policy has "authenticated" role checked
- [ ] INSERT policy is enabled (green toggle)
- [ ] User is logged in (check console)
- [ ] No conflicting policies exist
- [ ] Browser cache cleared
- [ ] Supabase API keys are correct

## Testing the Fix

After applying the fix:

1. **Clear browser cache**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Logout and login** to admin portal
3. **Go to Website Management**
4. **Click "Add Media"**
5. **Select a small image file** (< 1MB)
6. **Add caption and date**
7. **Click "Add Media"**

If it still fails, check the browser console for the exact error message and share it.

## Still Not Working?

If none of the above works, try this nuclear option:

### Option 1: Disable RLS Temporarily (For Testing Only)
```sql
-- Run in Supabase SQL Editor
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

**WARNING**: This disables all security. Only use for testing, then re-enable:
```sql
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

### Option 2: Check Storage Extension
```sql
-- Verify storage extension is installed
SELECT * FROM pg_extension WHERE extname = 'storage';
```

If not installed:
```sql
CREATE EXTENSION IF NOT EXISTS storage;
```

### Option 3: Recreate Bucket
1. Delete the 'media' bucket completely
2. Create a new bucket named 'media'
3. Set it to public
4. Recreate all 4 policies from scratch
5. Test again

## Contact Support

If all else fails:
1. Take screenshot of your policies
2. Copy the exact error from console
3. Check Supabase status page for outages
4. Contact Supabase support with details