-- Fix Row Level Security Policies
-- Run this in Supabase SQL Editor to fix the "violates row-level security policy" error

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations on admin" ON admin;
DROP POLICY IF EXISTS "Allow all operations on players" ON players;
DROP POLICY IF EXISTS "Allow all operations on payments" ON payments;
DROP POLICY IF EXISTS "Allow all operations on investments" ON investments;
DROP POLICY IF EXISTS "Allow all operations on shuttle_stock" ON shuttle_stock;

-- Create permissive policies for development
CREATE POLICY "Allow all operations on admin" ON admin FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on players" ON players FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on payments" ON payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on investments" ON investments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on shuttle_stock" ON shuttle_stock FOR ALL USING (true) WITH CHECK (true);

-- Grant permissions to anon (not logged in) and authenticated (logged in) users
GRANT ALL ON admin TO anon, authenticated;
GRANT ALL ON players TO anon, authenticated;
GRANT ALL ON payments TO anon, authenticated;
GRANT ALL ON investments TO anon, authenticated;
GRANT ALL ON shuttle_stock TO anon, authenticated;

-- Grant usage on sequences (for auto-incrementing IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('admin', 'players', 'payments', 'investments', 'shuttle_stock');