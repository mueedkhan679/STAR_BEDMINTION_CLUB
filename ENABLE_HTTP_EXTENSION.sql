-- Enable HTTP Extension for Supabase
-- This is required for the email notification trigger to work

-- Enable the http extension
CREATE EXTENSION IF NOT EXISTS http;

-- Verify it's enabled
SELECT extname, extversion FROM pg_extension WHERE extname = 'http';

-- If you get an error about permissions, you may need to run this as a superuser
-- In Supabase, this should work without issues

-- Test the extension (optional)
-- SELECT http_get('https://www.google.com');