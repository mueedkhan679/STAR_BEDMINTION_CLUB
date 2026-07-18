-- Fix RLS for website_content table
-- Run this in Supabase SQL Editor to fix the "no changes detected" error

-- Step 1: Check current RLS status
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'website_content';

-- Step 2: Disable RLS temporarily to test
ALTER TABLE website_content DISABLE ROW LEVEL SECURITY;

-- Step 3: Test if update works now (try updating from admin panel)
-- If it works, the problem is RLS. Re-enable and create proper policies below.

-- Step 4: Re-enable RLS
ALTER TABLE website_content ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read website_content" ON website_content;
DROP POLICY IF EXISTS "Allow authenticated update website_content" ON website_content;
DROP POLICY IF EXISTS "Allow authenticated insert website_content" ON website_content;
DROP POLICY IF EXISTS "Allow all read website_content" ON website_content;
DROP POLICY IF EXISTS "Allow all update website_content" ON website_content;

-- Step 6: Create permissive policies for testing
CREATE POLICY "Allow all read website_content" ON website_content FOR SELECT USING (true);
CREATE POLICY "Allow all update website_content" ON website_content FOR UPDATE USING (true);
CREATE POLICY "Allow all insert website_content" ON website_content FOR INSERT WITH CHECK (true);

-- Step 7: Grant permissions
GRANT ALL ON website_content TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Step 8: Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'website_content';

-- Success message
SELECT 'RLS policies for website_content fixed! Try updating now.' as message;

-- IMPORTANT: After testing, you can secure the policies:
-- Replace the permissive policies with:
-- CREATE POLICY "Allow authenticated update website_content" ON website_content FOR UPDATE USING (auth.role() = 'authenticated');
-- CREATE POLICY "Allow authenticated insert website_content" ON website_content FOR INSERT WITH CHECK (auth.role() = 'authenticated');