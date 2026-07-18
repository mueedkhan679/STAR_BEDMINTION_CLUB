-- Supabase Storage Setup for Media Uploads
-- Run this in Supabase SQL Editor to create storage bucket and policies

-- Create a storage bucket for media files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg']
) ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public to view media files
CREATE POLICY "Public can view media files" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

-- Create policy to allow authenticated users to upload media files
CREATE POLICY "Authenticated users can upload media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'media' 
    AND auth.role() = 'authenticated'
  );

-- Create policy to allow authenticated users to update media files
CREATE POLICY "Authenticated users can update media" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'media' 
    AND auth.role() = 'authenticated'
  );

-- Create policy to allow authenticated users to delete media files
CREATE POLICY "Authenticated users can delete media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'media' 
    AND auth.role() = 'authenticated'
  );

-- Grant permissions
GRANT ALL ON storage.buckets TO anon, authenticated;
GRANT ALL ON storage.objects TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA storage TO anon, authenticated;

-- Success message
SELECT 'Storage bucket "media" created successfully!' as message;