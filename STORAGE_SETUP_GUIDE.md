# Supabase Storage Setup Guide

## Error Explanation
The SQL error "must be owner of table objects" occurs because storage buckets in Supabase cannot be created via SQL queries. They must be created through the Supabase Dashboard UI.

## Step-by-Step Setup Instructions

### Step 1: Create Storage Bucket

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Login to your account
   - Select your project

2. **Navigate to Storage**
   - Click on "Storage" in the left sidebar
   - Click "New bucket" button

3. **Create Media Bucket**
   - **Name**: `media` (must be exactly "media")
   - **Public bucket**: Toggle ON (enable public access)
   - **File size limit**: 50 MB (or leave default)
   - **Allowed MIME types**: Leave empty or add:
     - image/jpeg
     - image/png
     - image/gif
     - image/webp
     - video/mp4
     - video/webm
   - Click "Create bucket"

### Step 2: Set Up Storage Policies

After creating the bucket, you need to set up Row Level Security (RLS) policies:

1. **Go to Storage Policies**
   - In the Storage section, click on your "media" bucket
   - Click "Policies" tab
   - Click "New policy"

2. **Create Policy 1: Public Read Access**
   - **Policy name**: "Public can view media files"
   - **Allowed operation**: SELECT
   - **Target roles**: anon, authenticated
   - **Policy definition**:
     ```sql
     bucket_id = 'media'
     ```
   - Click "Review" then "Save policy"

3. **Create Policy 2: Authenticated Upload**
   - Click "New policy"
   - **Policy name**: "Authenticated users can upload media"
   - **Allowed operation**: INSERT
   - **Target roles**: authenticated
   - **Policy definition**:
     ```sql
     bucket_id = 'media'
     ```
   - Click "Review" then "Save policy"

4. **Create Policy 3: Authenticated Update**
   - Click "New policy"
   - **Policy name**: "Authenticated users can update media"
   - **Allowed operation**: UPDATE
   - **Target roles**: authenticated
   - **Policy definition**:
     ```sql
     bucket_id = 'media'
     ```
   - Click "Review" then "Save policy"

5. **Create Policy 4: Authenticated Delete**
   - Click "New policy"
   - **Policy name**: "Authenticated users can delete media"
   - **Allowed operation**: DELETE
   - **Target roles**: authenticated
   - **Policy definition**:
     ```sql
     bucket_id = 'media'
     ```
   - Click "Review" then "Save policy"

### Step 3: Verify Setup

1. **Test Upload**
   - Go to your admin portal
   - Navigate to Website Management
   - Click "Add Media"
   - Select an image or video file
   - Add caption and date
   - Click "Add Media"

2. **Check Storage**
   - Go back to Supabase Dashboard → Storage
   - You should see your uploaded file in the "media" bucket

### Alternative: Use Supabase CLI (Advanced)

If you prefer using CLI, you can create the bucket using Supabase CLI:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Create storage bucket (requires local Supabase config)
supabase storage create media --public --file-size-limit 50MB
```

## Troubleshooting

### Error: "Bucket not found"
- Make sure the bucket name is exactly `media` (lowercase)
- Check that the bucket is set to public

### Error: "new row violates row-level security policy"
This means the INSERT policy is not working properly. Here's how to fix it:

**Solution 1: Check Policy Configuration**
1. Go to Supabase Dashboard → Storage → media bucket → Policies
2. Find the "Authenticated users can upload media" policy
3. Make sure:
   - **Allowed operation**: INSERT is checked
   - **Target roles**: authenticated is checked
   - **Policy definition**: `bucket_id = 'media'`

**Solution 2: Use Visual Policy Builder (Recommended)**
1. Delete the existing INSERT policy
2. Click "New policy"
3. Select "For full customization"
4. Fill in:
   - Policy name: "Allow authenticated uploads"
   - Allowed operation: Check ONLY "INSERT"
   - Target roles: Check ONLY "authenticated"
5. In Policy definition, use visual builder:
   - Field: `bucket_id`
   - Operation: `=`
   - Value: `media`
6. Click "Review" then "Save policy"

**Solution 3: Use Simplified Policy (For Testing)**
If the above doesn't work, create a permissive policy:
1. New policy → "For full customization"
2. Policy name: "Allow all authenticated operations"
3. Allowed operation: Check ALL (INSERT, UPDATE, DELETE, SELECT)
4. Target roles: authenticated
5. Policy definition: `true` (allows all operations)
6. Save policy

**Solution 4: Check Authentication**
- Make sure you're actually logged in to the admin portal
- Open browser console (F12) and check for auth errors
- Try logging out and logging back in

### Error: "Permission denied"
- Verify that RLS policies are created correctly
- Make sure you're logged in as an authenticated user in the admin portal
- Check that the policies allow the authenticated role

### Error: "File too large"
- The default limit is 50MB
- You can increase it in bucket settings if needed

### Upload fails silently
- Check browser console for errors (F12)
- Verify Supabase API keys are correct in `.env` file
- Make sure storage bucket exists and is public

## Important Notes

1. **Bucket Name**: Must be exactly `media` (the code expects this name)
2. **Public Access**: The bucket must be public so the public website can view files
3. **File Types**: Only images and videos are allowed (configured in bucket settings)
4. **File Naming**: Files are automatically renamed with timestamps to avoid conflicts
5. **Storage Location**: Files are stored in Supabase's cloud storage

## Quick Test

After setup, test with this simple upload:
1. Go to Website Management
2. Click "Add Media"
3. Select a small image file (< 1MB)
4. Add caption: "Test Image"
5. Add date: Today
6. Click "Add Media"

If successful, you'll see a success toast and the image will appear in the media posts grid.