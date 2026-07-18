-- Update website_content table to add profile pictures
-- Run this in Supabase SQL Editor

-- Add columns for director and manager profile pictures
ALTER TABLE website_content 
ADD COLUMN IF NOT EXISTS director_profile_url TEXT,
ADD COLUMN IF NOT EXISTS manager_profile_url TEXT;

-- Comment on columns
COMMENT ON COLUMN website_content.director_profile_url IS 'URL to the Club Director profile picture';
COMMENT ON COLUMN website_content.manager_profile_url IS 'URL to the Club Manager profile picture';

-- Success message
SELECT 'Profile picture columns added successfully!' as message;