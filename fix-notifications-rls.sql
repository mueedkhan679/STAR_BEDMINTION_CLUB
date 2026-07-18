-- Fix RLS for notifications table
-- Run this in Supabase SQL Editor to fix notifications not working

-- Step 1: Check current RLS status
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'notifications';

-- Step 2: Disable RLS temporarily to test
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Step 3: Test if notifications work now (try creating from admin panel)
-- If it works, the problem is RLS. Re-enable and create proper policies below.

-- Step 4: Re-enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read notifications" ON notifications;
DROP POLICY IF EXISTS "Allow authenticated insert notifications" ON notifications;
DROP POLICY IF EXISTS "Allow authenticated update notifications" ON notifications;
DROP POLICY IF EXISTS "Allow authenticated delete notifications" ON notifications;
DROP POLICY IF EXISTS "Allow all read notifications" ON notifications;
DROP POLICY IF EXISTS "Allow all insert notifications" ON notifications;
DROP POLICY IF EXISTS "Allow all update notifications" ON notifications;
DROP POLICY IF EXISTS "Allow all delete notifications" ON notifications;

-- Step 6: Create permissive policies for testing
CREATE POLICY "Allow all read notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Allow all insert notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update notifications" ON notifications FOR UPDATE USING (true);
CREATE POLICY "Allow all delete notifications" ON notifications FOR DELETE USING (true);

-- Step 7: Grant permissions
GRANT ALL ON notifications TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Step 8: Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'notifications';

-- Success message
SELECT 'RLS policies for notifications fixed! Try creating notifications now.' as message;

-- IMPORTANT: After testing, you can secure the policies:
-- Replace the permissive policies with:
-- CREATE POLICY "Allow public read notifications" ON notifications FOR SELECT USING (true);
-- CREATE POLICY "Allow authenticated insert notifications" ON notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- CREATE POLICY "Allow authenticated update notifications" ON notifications FOR UPDATE USING (auth.role() = 'authenticated');
-- CREATE POLICY "Allow authenticated delete notifications" ON notifications FOR DELETE USING (auth.role() = 'authenticated');