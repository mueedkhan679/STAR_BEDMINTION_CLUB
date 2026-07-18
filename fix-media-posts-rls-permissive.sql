-- Permissive RLS Fix for media_posts table
-- Use this if the previous fix didn't work
-- Run this in Supabase SQL Editor

-- Step 1: Disable RLS completely to test
ALTER TABLE media_posts DISABLE ROW LEVEL SECURITY;

-- Step 2: Test if insert works now
-- Try uploading from the admin panel
-- If it works, the problem is definitely RLS

-- Step 3: Re-enable RLS
ALTER TABLE media_posts ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop ALL existing policies (clean slate)
DROP POLICY IF EXISTS "Allow public read media_posts" ON media_posts;
DROP POLICY IF EXISTS "Allow authenticated insert media_posts" ON media_posts;
DROP POLICY IF EXISTS "Allow authenticated update media_posts" ON media_posts;
DROP POLICY IF EXISTS "Allow authenticated delete media_posts" ON media_posts;
DROP POLICY IF EXISTS "Allow all operations media_posts" ON media_posts;

-- Step 5: Create PERMISSIVE policies (allows everything for testing)
-- These are less secure but will definitely work

-- Policy 1: Allow everyone to read
CREATE POLICY "Allow all read media_posts" ON media_posts
  FOR SELECT USING (true);

-- Policy 2: Allow everyone to insert (CHANGED FROM AUTHENTICATED ONLY)
CREATE POLICY "Allow all insert media_posts" ON media_posts
  FOR INSERT WITH CHECK (true);

-- Policy 3: Allow everyone to update
CREATE POLICY "Allow all update media_posts" ON media_posts
  FOR UPDATE USING (true);

-- Policy 4: Allow everyone to delete
CREATE POLICY "Allow all delete media_posts" ON media_posts
  FOR DELETE USING (true);

-- Step 6: Grant all permissions
GRANT ALL ON media_posts TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Step 7: Verify
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'media_posts';

-- Success
SELECT 'Permissive RLS policies created! Upload should work now.' as message;

-- IMPORTANT: After testing, secure the policies:
-- 1. Delete the permissive policies above
-- 2. Create proper policies that check auth.role() = 'authenticated'
-- 3. Make sure you're actually logged in when uploading