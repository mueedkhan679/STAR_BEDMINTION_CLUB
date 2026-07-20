-- Simple migration to add description column to players table
-- Run this in Supabase SQL Editor

ALTER TABLE players ADD COLUMN IF NOT EXISTS description TEXT;

-- Success message
SELECT 'Description column added successfully!' as message;