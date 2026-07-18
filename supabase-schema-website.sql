-- Star Badminton Club - Public Website Tables
-- Run this in Supabase SQL Editor

-- Drop existing tables if they exist
DROP TABLE IF EXISTS media_posts;
DROP TABLE IF EXISTS website_content;

-- Create website_content table
CREATE TABLE IF NOT EXISTS website_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_name TEXT NOT NULL DEFAULT 'Star Badminton Club',
  logo_url TEXT,
  club_location TEXT NOT NULL DEFAULT 'Star Badminton Club Location',
  manager_name TEXT NOT NULL DEFAULT 'Yahya',
  director_name TEXT NOT NULL DEFAULT 'Kaleem Ullah',
  contact_email TEXT,
  contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create media_posts table
CREATE TABLE IF NOT EXISTS media_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  url TEXT NOT NULL,
  caption TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_media_posts_created_at ON media_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_media_posts_type ON media_posts(type);

-- Insert default website content
INSERT INTO website_content (website_name, club_location, manager_name, director_name)
VALUES (
  'Star Badminton Club',
  'Star Badminton Club Location',
  'Yahya',
  'Kaleem Ullah'
) ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE website_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for website_content
-- Public can read, authenticated users can write
CREATE POLICY "Allow public read access to website_content" ON website_content FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to insert website_content" ON website_content FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update website_content" ON website_content FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to delete website_content" ON website_content FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for media_posts
-- Public can read, authenticated users can write
CREATE POLICY "Allow public read access to media_posts" ON media_posts FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to insert media_posts" ON media_posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update media_posts" ON media_posts FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to delete media_posts" ON media_posts FOR DELETE USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON website_content TO anon, authenticated;
GRANT ALL ON media_posts TO anon, authenticated;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;