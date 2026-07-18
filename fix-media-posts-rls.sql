-- Fix RLS for media_posts table
-- Run this in Supabase SQL Editor

-- First, check if RLS is enabled on media_posts
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'media_posts';

-- Disable RLS temporarily to test
ALTER TABLE media_posts DISABLE ROW LEVEL SECURITY;

-- Test if insert works now
-- If yes, then RLS was the problem. Re-enable and create proper policies below.

-- Re-enable RLS
ALTER TABLE media_posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read media_posts" ON media_posts;
DROP POLICY IF EXISTS "Allow authenticated insert media_posts" ON media_posts;
DROP POLICY IF EXISTS "Allow authenticated update media_posts" ON media_posts;
DROP POLICY IF EXISTS "Allow authenticated delete media_posts" ON media_posts;

-- Create policy for public read access
CREATE POLICY "Allow public read media_posts" ON media_posts
  FOR SELECT USING (true);

-- Create policy for authenticated insert
CREATE POLICY "Allow authenticated insert media_posts" ON media_posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policy for authenticated update
CREATE POLICY "Allow authenticated update media_posts" ON media_posts
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create policy for authenticated delete
CREATE POLICY "Allow authenticated delete media_posts" ON media_posts
  FOR DELETE USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON media_posts TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'media_posts';

-- Success message
SELECT 'RLS policies for media_posts created successfully!' as message;