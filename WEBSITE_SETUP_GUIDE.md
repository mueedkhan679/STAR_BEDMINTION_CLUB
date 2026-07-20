# Star Badminton Club Dargai - Website Setup Guide

## 🏸 Overview

This guide will help you set up the admin-managed portal and public website for Star Badminton Club Dargai.

## 📋 Prerequisites

- Supabase account (already configured)
- Node.js and npm installed
- Git for version control

## 🗄️ Step 1: Database Setup

### 1.1 Run Enhanced Schema

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase-schema-enhanced.sql`
4. Click **Run** to execute the script

This will create the following new tables:
- `posts` - For admin posts/updates
- `game_timings` - For managing game schedules
- `player_stars` - For star rating system

### 1.2 Verify Tables

After running the schema, verify these tables exist in your Supabase **Table Editor**:
- ✅ website_content
- ✅ media_posts
- ✅ posts
- ✅ game_timings
- ✅ player_stars
- ✅ players (existing)
- ✅ notifications (existing)

## 🎨 Step 2: Public Website Features

The public website (`/public-website`) includes:

### 2.1 Landing Animation
- **2-second animated intro** with club logo and name
- Smooth fade-in effects using Framer Motion

### 2.2 Header Section
- **Website Name**: Displays "Star Badminton Club Dargai" (editable from admin)
- **Location**: Clickable map link that opens Google Maps
- **Logo**: Badminton club logo with hover animation

### 2.3 Hero Slideshow
- **Auto-playing image carousel** (4-second intervals)
- **Custom captions** with dates
- **Navigation arrows** and dot indicators
- **Pinned media** support for important slides

### 2.4 Posts Section (Latest Updates)
- Admin-created posts appear at the **top of the feed**
- **Pinned posts** stay at the top
- Support for **images, titles, and content**
- Chronological display with dates

### 2.5 Club Leadership Section
- **Club Director** profile with photo
- **Club Manager** profile with photo
- Editable names and profile pictures from admin

### 2.6 Game Timing Section
- Displays current game schedule
- **Editable timings** from admin portal
- Shows day, start time, and end time

### 2.7 Our Players Section
- **Star-ranked player grid**
- **Auto-sorted by star rating** (highest first)
- Player cards show:
  - Profile picture
  - Name
  - Star rating (1-5 stars)
  - Playing since year
- **Click to view detailed profile**

### 2.8 Player Profile View
- **Fixed "Back" button** (top-right corner)
- Displays:
  - Large profile picture
  - Full name
  - Father's name (if available)
  - Email (clickable mailto link)
  - About section
  - Playing since year
  - Star rating (visual 5-star display)

### 2.9 Photo Albums Section
- **Two view modes**:
  - **Albums View**: Grouped by date
  - **All Photos**: Grid view of all images
- **Album detail view** with image count
- **Image viewer modal** with navigation
- Click any photo to view full-size

### 2.10 Features Section
- Three feature cards with icons:
  - Professional Training
  - Tournament Ready
  - Championship Quality

### 2.11 Footer
- Club Manager name
- Club Director name
- Location
- Contact information
- Software credits

## 🔧 Step 3: Admin Portal Features

Access the admin portal at `/website` (requires authentication).

### 3.1 Manager & Director Tab
- **Edit website name** (updates instantly on public site)
- **Update logo URL**
- **Change club location** and map URL
- **Edit manager/director names**
- **Upload profile pictures** for both
- **Update contact information** (email, phone)

### 3.2 Pictures & Videos Tab
- **Upload multiple images/videos** at once
- **Add captions and dates**
- **Pin media** to slideshow
- **Edit existing media**
- **Delete media** with confirmation
- **Base64 encoding** for instant display

### 3.3 Posts Tab (NEW)
- **Create new posts** with:
  - Title
  - Content/description
  - Image URL (optional)
  - Pin to top option
- **Edit existing posts**
- **Delete posts**
- **Pinned posts** appear first on public website

### 3.4 Game Timings Tab (NEW)
- **Set game day** (e.g., "Daily", "Weekends")
- **Configure start and end times**
- **Add description**
- **Activate/deactivate** timings
- **Edit existing timings**

### 3.5 Player Stars Tab (NEW)
- **View all players** with current ratings
- **Click to rate** any player (1-5 stars)
- **Visual star selector** in modal
- **Auto-sorts players** on public website by rating

### 3.6 Notifications Tab
- **Create notifications** with types:
  - Info
  - Warning
  - Success
  - Urgent
- **Activate/deactivate** notifications
- **Edit and delete** notifications

## 🎯 Step 4: Star Rating System

### How It Works:
1. Admin goes to **Player Stars** tab
2. Clicks **Edit** on any player
3. Selects rating (1-5 stars) in modal
4. Clicks **Save Rating**
5. Public website **auto-sorts** players by rating (highest first)
6. Player cards display their star rating

### Features:
- **Upsert operation** (creates or updates rating)
- **Real-time updates** on public site
- **Visual feedback** with filled/empty stars

## 📱 Step 5: Responsive Design

### Mobile-First Approach:
- **Breakpoints**:
  - Mobile: < 640px (1 column)
  - Tablet: 640px - 1024px (2-3 columns)
  - Desktop: > 1024px (4-5 columns)

### Responsive Elements:
- Navigation (sticky header)
- Player grid (adaptive columns)
- Photo gallery (adaptive grid)
- Forms (stacked on mobile)
- Modals (full-width on mobile)

## 🎨 Step 6: Design System

### Color Palette:
- **Primary Base**: Deep Navy Blue (#001f3f)
- **Accent**: Gold/Yellow (#FFD700)
- **Background**: White/Light Grey (#F4F7F6)
- **Gradients**: Amber to Orange for highlights

### Typography:
- **Font**: System sans-serif (Tailwind default)
- **Weights**: Bold for headings, medium for body
- **Sizes**: Responsive scaling

### Animations:
- **Framer Motion** for smooth transitions
- **Hover effects** on cards and buttons
- **Scroll-triggered animations**
- **Landing page animation**

## 🔄 Step 7: Real-Time Updates

### How Updates Work:
1. Admin makes change in portal
2. Data saved to Supabase
3. `fetchData()` called to refresh state
4. Public website automatically reflects changes
5. No page refresh needed

### Example Flow:
```
Admin updates website name
    ↓
Saved to website_content table
    ↓
fetchData() triggered
    ↓
State updated in React
    ↓
Public website re-renders with new name
```

## 🚀 Step 8: Testing

### Test Checklist:

#### Public Website:
- [ ] Landing animation plays (2 seconds)
- [ ] Header displays correct name and location
- [ ] Location link opens Google Maps
- [ ] Slideshow auto-advances every 4 seconds
- [ ] Navigation arrows work
- [ ] Dot indicators show current slide
- [ ] Posts appear at top of content
- [ ] Pinned posts show pin icon
- [ ] Director and Manager profiles display
- [ ] Game timing shows correctly
- [ ] Players sorted by star rating
- [ ] Clicking player opens profile view
- [ ] Back button returns to main page
- [ ] Photo albums display correctly
- [ ] Gallery view shows all photos
- [ ] Image viewer modal works
- [ ] Footer information is correct

#### Admin Portal:
- [ ] Can edit website name
- [ ] Can update logo URL
- [ ] Can change location and map URL
- [ ] Can upload manager/director photos
- [ ] Can upload media (images/videos)
- [ ] Can create posts
- [ ] Can pin posts to top
- [ ] Can edit game timings
- [ ] Can rate players (1-5 stars)
- [ ] Players auto-sort by rating
- [ ] Can create notifications
- [ ] All changes reflect on public site

## 📊 Step 9: Database Schema Reference

### Tables Created:

#### `posts`
```sql
- id (UUID, Primary Key)
- title (TEXT)
- content (TEXT)
- image_url (TEXT, Optional)
- is_pinned (BOOLEAN, Default: true)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### `game_timings`
```sql
- id (UUID, Primary Key)
- day (TEXT, Default: 'Daily')
- start_time (TEXT, Default: '19:15')
- end_time (TEXT, Default: '21:00')
- description (TEXT, Optional)
- is_active (BOOLEAN, Default: true)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### `player_stars`
```sql
- id (UUID, Primary Key)
- player_id (UUID, Foreign Key to players)
- rating (INTEGER, 1-5)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- UNIQUE(player_id)
```

## 🎯 Step 10: Usage Instructions

### For Admins:

1. **Login** to admin portal
2. Navigate to **Website** section
3. Use tabs to manage different content:
   - **Manager & Director**: Update club info
   - **Pictures & Videos**: Upload media for slideshow
   - **Posts**: Create announcements
   - **Game Timings**: Set playing hours
   - **Player Stars**: Rate players
   - **Notifications**: Send alerts

### For Public:
1. Visit `/public-website`
2. Browse content
3. Click players to view profiles
4. View photo albums
5. Check game timings
6. See latest updates

## 🐛 Troubleshooting

### Common Issues:

#### 1. Images not loading
- **Solution**: Ensure images are uploaded as base64 or valid URLs
- **Check**: Browser console for CORS errors

#### 2. Players not sorting by stars
- **Solution**: Verify `player_stars` table has data
- **Check**: Run `SELECT * FROM player_stars` in Supabase

#### 3. Posts not appearing
- **Solution**: Ensure `is_pinned` is set correctly
- **Check**: Verify posts exist in database

#### 4. Changes not reflecting
- **Solution**: Hard refresh browser (Ctrl+Shift+R)
- **Check**: Verify `fetchData()` is called after updates

## 📝 Notes

- All images are stored as **base64** in database
- **No external storage** required
- **Real-time updates** via state management
- **Mobile-responsive** design
- **SEO-friendly** URLs

## 🎉 Success!

Your Star Badminton Club Dargai website is now fully functional with:
- ✅ Modern, animated public website
- ✅ Comprehensive admin portal
- ✅ Star rating system
- ✅ Real-time updates
- ✅ Responsive design
- ✅ All required features

## 📞 Support

For issues or questions:
- Check browser console for errors
- Verify Supabase logs
- Review this guide

---

**Developed by Abdul Mueed Khan, 2026**
**All software control and management are exclusively handled by the Club Manager.**