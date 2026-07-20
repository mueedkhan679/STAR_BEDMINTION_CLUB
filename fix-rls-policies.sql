-- Fix RLS Policies for Star Badminton Club Dargai
-- Run this in Supabase SQL Editor to fix permission errors

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access to website_content" ON website_content;
DROP POLICY IF EXISTS "Allow authenticated users to insert website_content" ON website_content;
DROP POLICY IF EXISTS "Allow authenticated users to update website_content" ON website_content;
DROP POLICY IF EXISTS "Allow authenticated users to delete website_content" ON website_content;

DROP POLICY IF EXISTS "Allow public read access to media_posts" ON media_posts;
DROP POLICY IF EXISTS "Allow authenticated users to insert media_posts" ON media_posts;
DROP POLICY IF EXISTS "Allow authenticated users to update media_posts" ON media_posts;
DROP POLICY IF EXISTS "Allow authenticated users to delete media_posts" ON media_posts;

DROP POLICY IF EXISTS "Allow public read access to posts" ON posts;
DROP POLICY IF EXISTS "Allow authenticated users to insert posts" ON posts;
DROP POLICY IF EXISTS "Allow authenticated users to update posts" ON posts;
DROP POLICY IF EXISTS "Allow authenticated users to delete posts" ON posts;

DROP POLICY IF EXISTS "Allow public read access to game_timings" ON game_timings;
DROP POLICY IF EXISTS "Allow authenticated users to insert game_timings" ON game_timings;
DROP POLICY IF EXISTS "Allow authenticated users to update game_timings" ON game_timings;
DROP POLICY IF EXISTS "Allow authenticated users to delete game_timings" ON game_timings;

DROP POLICY IF EXISTS "Allow public read access to player_stars" ON player_stars;
DROP POLICY IF EXISTS "Allow public insert access to player_stars" ON player_stars;
DROP POLICY IF EXISTS "Allow public update access to player_stars" ON player_stars;
DROP POLICY IF EXISTS "Allow public delete access to player_stars" ON player_stars;

-- Create new public access policies for website_content
CREATE POLICY "Allow public read access to website_content" ON website_content FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to website_content" ON website_content FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to website_content" ON website_content FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to website_content" ON website_content FOR DELETE USING (true);

-- Create new public access policies for media_posts
CREATE POLICY "Allow public read access to media_posts" ON media_posts FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to media_posts" ON media_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to media_posts" ON media_posts FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to media_posts" ON media_posts FOR DELETE USING (true);

-- Create new public access policies for posts
CREATE POLICY "Allow public read access to posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to posts" ON posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to posts" ON posts FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to posts" ON posts FOR DELETE USING (true);

-- Create new public access policies for game_timings
CREATE POLICY "Allow public read access to game_timings" ON game_timings FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to game_timings" ON game_timings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to game_timings" ON game_timings FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to game_timings" ON game_timings FOR DELETE USING (true);

-- Create new public access policies for player_stars
CREATE POLICY "Allow public read access to player_stars" ON player_stars FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to player_stars" ON player_stars FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to player_stars" ON player_stars FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to player_stars" ON player_stars FOR DELETE USING (true);

-- Success message
SELECT 'RLS policies updated successfully! All tables now have public access.' as message;