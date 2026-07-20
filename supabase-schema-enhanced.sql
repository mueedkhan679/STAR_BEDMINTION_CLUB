-- Star Badminton Club Dargai - Enhanced Database Schema
-- Run this in Supabase SQL Editor to add all required features

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS player_stars;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS game_timings;
DROP TABLE IF EXISTS media_posts;
DROP TABLE IF EXISTS website_content;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Website Content table
CREATE TABLE IF NOT EXISTS website_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_name TEXT NOT NULL DEFAULT 'Star Badminton Club Dargai',
  logo_url TEXT,
  club_location TEXT NOT NULL DEFAULT 'Dargai, Pakistan',
  location_map_url TEXT DEFAULT 'https://maps.google.com/?q=Dargai,Pakistan',
  manager_name TEXT NOT NULL DEFAULT 'Yahya',
  director_name TEXT NOT NULL DEFAULT 'Kaleem Ullah',
  contact_email TEXT,
  contact_phone TEXT,
  manager_profile_url TEXT,
  director_profile_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Media Posts table (for slideshow and gallery)
CREATE TABLE IF NOT EXISTS media_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  url TEXT NOT NULL,
  caption TEXT NOT NULL,
  date TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Posts table (for admin posts that appear at top of feed)
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  is_pinned BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Game Timings table
CREATE TABLE IF NOT EXISTS game_timings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day TEXT NOT NULL DEFAULT 'Daily',
  start_time TEXT NOT NULL DEFAULT '19:15',
  end_time TEXT NOT NULL DEFAULT '21:00',
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Player Stars table (for star rating system)
CREATE TABLE IF NOT EXISTS player_stars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(player_id)
);

-- Add description column to players table if it doesn't exist
ALTER TABLE players ADD COLUMN IF NOT EXISTS description TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_media_posts_created_at ON media_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_media_posts_is_pinned ON media_posts(is_pinned);
CREATE INDEX IF NOT EXISTS idx_posts_is_pinned ON posts(is_pinned);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_player_stars_player_id ON player_stars(player_id);

-- Insert default website content
INSERT INTO website_content (website_name, club_location, manager_name, director_name)
VALUES (
  'Star Badminton Club Dargai',
  'Dargai, Pakistan',
  'Yahya',
  'Kaleem Ullah'
) ON CONFLICT (id) DO NOTHING;

-- Insert default game timing
INSERT INTO game_timings (day, start_time, end_time, description)
VALUES (
  'Daily',
  '19:15',
  '21:00',
  'We play badminton daily from 7:15 PM to 9:00 PM'
) ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE website_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_timings ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stars ENABLE ROW LEVEL SECURITY;

-- Create policies for website_content (public access for all operations)
CREATE POLICY "Allow public read access to website_content" ON website_content FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to website_content" ON website_content FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to website_content" ON website_content FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to website_content" ON website_content FOR DELETE USING (true);

-- Create policies for media_posts (public access for all operations)
CREATE POLICY "Allow public read access to media_posts" ON media_posts FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to media_posts" ON media_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to media_posts" ON media_posts FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to media_posts" ON media_posts FOR DELETE USING (true);

-- Create policies for posts (public access for all operations)
CREATE POLICY "Allow public read access to posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to posts" ON posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to posts" ON posts FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to posts" ON posts FOR DELETE USING (true);

-- Create policies for game_timings (public access for all operations)
CREATE POLICY "Allow public read access to game_timings" ON game_timings FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to game_timings" ON game_timings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to game_timings" ON game_timings FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to game_timings" ON game_timings FOR DELETE USING (true);

-- Create policies for player_stars (public access for all operations)
CREATE POLICY "Allow public read access to player_stars" ON player_stars FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to player_stars" ON player_stars FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to player_stars" ON player_stars FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to player_stars" ON player_stars FOR DELETE USING (true);

-- Grant permissions
GRANT ALL ON website_content TO anon, authenticated;
GRANT ALL ON media_posts TO anon, authenticated;
GRANT ALL ON posts TO anon, authenticated;
GRANT ALL ON game_timings TO anon, authenticated;
GRANT ALL ON player_stars TO anon, authenticated;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Success message
SELECT 'Enhanced schema created successfully!' as message;