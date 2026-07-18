import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MapPin, 
  Users, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Trophy,
  Target,
  Award,
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
  X,
  Clock,
  Star,
  Sparkles
} from 'lucide-react'
import { supabase } from '../lib/supabase'

// Badminton logo SVG component - Modern Design
const BadmintonLogo = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#F59E0B', stopOpacity: 1 }} />
        <stop offset="50%" style={{ stopColor: '#D97706', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#B45309', stopOpacity: 1 }} />
      </linearGradient>
      <filter id="shadow">
        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.3"/>
      </filter>
    </defs>
    <circle cx="50" cy="50" r="45" fill="url(#logoGradient)" filter="url(#shadow)" />
    <path
      d="M 50 20 Q 65 35 65 50 Q 65 65 50 80 Q 35 65 35 50 Q 35 35 50 20"
      fill="none"
      stroke="white"
      strokeWidth="3"
      filter="url(#shadow)"
    />
    <line x1="50" y1="20" x2="50" y2="80" stroke="white" strokeWidth="2" />
    <circle cx="50" cy="50" r="8" fill="white" />
  </svg>
)

interface WebsiteContent {
  id: string
  website_name: string
  logo_url: string
  club_location: string
  manager_name: string
  director_name: string
  contact_email: string
  contact_phone: string
  manager_profile_url?: string
  director_profile_url?: string
}

interface MediaPost {
  id: string
  type: 'image' | 'video'
  url: string
  caption: string
  date: string
  created_at: string
}

interface Album {
  date: string
  posts: MediaPost[]
}

function PublicWebsite() {
  const [websiteContent, setWebsiteContent] = useState<WebsiteContent | null>(null)
  const [mediaPosts, setMediaPosts] = useState<MediaPost[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'albums' | 'gallery'>('albums')
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    fetchWebsiteData()
  }, [])

  const fetchWebsiteData = async () => {
    try {
      const [contentRes, postsRes] = await Promise.all([
        supabase.from('website_content').select('*').single(),
        supabase.from('media_posts').select('*').order('created_at', { ascending: false })
      ])

      if (contentRes.data) setWebsiteContent(contentRes.data)
      if (postsRes.data) {
        setMediaPosts(postsRes.data)
        const grouped = groupPostsByDate(postsRes.data)
        setAlbums(grouped)
      }
    } catch (error) {
      console.error('Error fetching website data:', error)
    } finally {
      setLoading(false)
    }
  }

  const groupPostsByDate = (posts: MediaPost[]): Album[] => {
    const grouped: { [key: string]: MediaPost[] } = {}
    
    posts.forEach(post => {
      const date = post.date || post.created_at.split('T')[0]
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(post)
    })

    return Object.entries(grouped)
      .map(([date, posts]) => ({ date, posts }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const handleImageError = (id: string) => {
    setImageErrors(prev => new Set(prev).add(id))
  }

  const nextImage = () => {
    if (selectedAlbum) {
      setSelectedImageIndex((prev) => (prev + 1) % selectedAlbum.posts.length)
    }
  }

  const prevImage = () => {
    if (selectedAlbum) {
      setSelectedImageIndex((prev) => (prev - 1 + selectedAlbum.posts.length) % selectedAlbum.posts.length)
    }
  }

  const nextSlide = () => {
    if (mediaPosts.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % mediaPosts.length)
    }
  }

  const prevSlide = () => {
    if (mediaPosts.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + mediaPosts.length) % mediaPosts.length)
    }
  }

  // Auto-advance slideshow
  useEffect(() => {
    if (mediaPosts.length > 0 && !selectedAlbum) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % mediaPosts.length)
      }, 4000)
      return () => clearInterval(timer)
    }
  }, [mediaPosts.length, selectedAlbum])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-amber-600 to-orange-700">
        <div className="text-2xl font-bold text-white animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Navigation - Logo on Right */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-black/50 backdrop-blur-md shadow-xl sticky top-0 z-50 border-b border-amber-500/30"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between w-full">
            {/* Left Side - Website Name */}
            <div className="text-left">
              <motion.h1 
                className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {websiteContent?.website_name || 'Star Badminton Club'}
              </motion.h1>
              <motion.p 
                className="text-sm text-amber-300 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Excellence in Every Smash
              </motion.p>
            </div>

            {/* Right Side - Logo & Location */}
            <div className="flex items-center gap-6">
              {/* Location */}
              <motion.div 
                className="hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-amber-500/30"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <MapPin className="w-5 h-5 text-amber-400" />
                <span className="text-sm text-white font-medium">
                  {websiteContent?.club_location || 'Star Badminton Club'}
                </span>
              </motion.div>

              {/* Logo */}
              <motion.div 
                className="w-16 h-16"
                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.1, rotate: 10 }}
              >
                <BadmintonLogo />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section with Animated Slideshow */}
      {mediaPosts.length > 0 && !selectedAlbum && (
        <div className="relative h-[400px] overflow-hidden bg-gray-900">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center justify-center p-8"
            >
              <div className="relative w-full h-full max-w-6xl mx-auto flex items-center justify-center">
                <img 
                  src={mediaPosts[currentSlide].url} 
                  alt={mediaPosts[currentSlide].caption}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-amber-900/40 to-orange-900/40" />
            </motion.div>
          </AnimatePresence>

          {/* Caption Overlay with animation */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-0 left-0 right-0 p-6 sm:p-12 text-white"
          >
            <div className="container mx-auto">
              <div className="max-w-4xl">
                <motion.div 
                  className="flex items-center gap-2 mb-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="bg-amber-500/80 backdrop-blur-sm p-2 rounded-lg">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-amber-200">
                    {new Date(mediaPosts[currentSlide].date).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </span>
                </motion.div>
                <motion.h2 
                  className="text-3xl sm:text-5xl font-bold leading-tight mb-3 drop-shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {mediaPosts[currentSlide].caption}
                </motion.h2>
                <motion.div 
                  className="h-1 w-20 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                />
              </div>
            </div>
          </motion.div>

          {/* Navigation Arrows */}
          {mediaPosts.length > 1 && (
            <>
              <motion.button 
                onClick={prevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-amber-500/30 hover:bg-amber-500/50 backdrop-blur-sm p-3 rounded-full text-white transition-all border-2 border-amber-400/40"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              <motion.button 
                onClick={nextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-amber-500/30 hover:bg-amber-500/50 backdrop-blur-sm p-3 rounded-full text-white transition-all border-2 border-amber-400/40"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </>
          )}

          {/* Dots Indicator */}
          {mediaPosts.length > 1 && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2">
              {mediaPosts.map((_, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentSlide ? 'bg-amber-400 w-10' : 'bg-white/50 w-2'
                  }`}
                  whileHover={{ scale: 1.3 }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content Sections */}
      <div className="container mx-auto px-4 py-12">
        {/* Director & Manager Profile Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mb-2">
              Club Leadership
            </h3>
            <p className="text-amber-200">Meet the team behind Star Badminton Club</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Director Profile */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-xl shadow-lg p-6 text-center border-2 border-purple-500/30 hover:border-purple-400/50 transition-all"
            >
              <div className="mb-4 flex justify-center">
                {websiteContent?.director_profile_url ? (
                  <img 
                    src={websiteContent.director_profile_url} 
                    alt={websiteContent.director_name || 'Director'}
                    className="w-32 h-32 rounded-full object-cover border-4 border-purple-500 shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center border-4 border-purple-500 shadow-lg">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
              </div>
              <h4 className="text-xl font-bold text-white mb-1">
                {websiteContent?.director_name || 'Kaleem Ullah'}
              </h4>
              <p className="text-sm text-purple-300 mb-2">Club Director</p>
              <div className="flex items-center justify-center gap-1">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-yellow-300">Leading since 2016</span>
              </div>
            </motion.div>

            {/* Manager Profile */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-md rounded-xl shadow-lg p-6 text-center border-2 border-blue-500/30 hover:border-blue-400/50 transition-all"
            >
              <div className="mb-4 flex justify-center">
                {websiteContent?.manager_profile_url ? (
                  <img 
                    src={websiteContent.manager_profile_url} 
                    alt={websiteContent.manager_name || 'Manager'}
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center border-4 border-blue-500 shadow-lg">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
              </div>
              <h4 className="text-xl font-bold text-white mb-1">
                {websiteContent?.manager_name || 'Yahya'}
              </h4>
              <p className="text-sm text-blue-300 mb-2">Club Manager</p>
              <div className="flex items-center justify-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-xs text-yellow-300">Managing since 2016</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Game Timing Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-md rounded-xl shadow-lg p-8 border-2 border-blue-500/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-blue-400 to-purple-500 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Game Timing
              </h3>
            </div>
            <p className="text-lg text-white leading-relaxed">
              We play badminton daily from 7:15 PM to 9:00 PM.
            </p>
          </div>
        </motion.div>

        {/* Our Experienced Players (Legacy) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mb-2">
              Our Experienced Players
            </h3>
            <p className="text-amber-200">Legacy players since 2016</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {['Kaleem', 'Yahya', 'Abdul Mueed', 'Zakria Zahid', 'Salih Muhammad'].map((player, idx) => (
              <motion.div
                key={player}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-md rounded-xl shadow-lg p-6 text-center border-2 border-amber-500/30 hover:border-amber-400/50 transition-all"
              >
                <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-4 rounded-full w-fit mx-auto mb-4">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-1">{player}</h4>
                <div className="flex items-center justify-center gap-1 text-amber-300">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-xs">Since 2016</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* New Players */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              New Players
            </h3>
            <p className="text-blue-200">Fresh talent joining our club</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Ahmad', 'Sherry', 'Jibran'].map((player, idx) => (
              <motion.div
                key={player}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-md rounded-xl shadow-lg p-6 text-center border-2 border-blue-500/30 hover:border-blue-400/50 transition-all"
              >
                <div className="bg-gradient-to-br from-blue-400 to-purple-500 p-4 rounded-full w-fit mx-auto mb-4">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-1">{player}</h4>
                <p className="text-sm text-blue-200">New Team Member</p>
                <div className="mt-3 flex items-center justify-center gap-1">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs text-yellow-300">Rising Star</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Photo Albums Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <motion.h3 
              className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              Photo Albums
            </motion.h3>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {setViewMode('albums'); setSelectedAlbum(null)}}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  viewMode === 'albums' 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg font-semibold' 
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                }`}
              >
                <Grid className="w-4 h-4" />
                Albums
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('gallery')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  viewMode === 'gallery' 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg font-semibold' 
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                }`}
              >
                <List className="w-4 h-4" />
                All Photos
              </motion.button>
            </div>
          </div>

          {selectedAlbum ? (
            /* Album Detail View */
            <div>
              <motion.button
                whileHover={{ x: -5 }}
                onClick={() => setSelectedAlbum(null)}
                className="flex items-center gap-2 text-amber-300 hover:text-white mb-4 font-medium"
              >
                <ChevronLeft className="w-5 h-5" />
                Back to Albums
              </motion.button>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-md rounded-xl shadow-lg p-6 mb-6 border border-amber-500/20"
              >
                <h4 className="text-2xl font-bold text-white mb-2">
                  {new Date(selectedAlbum.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h4>
                <p className="text-amber-200">{selectedAlbum.posts.length} photos in this album</p>
              </motion.div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {selectedAlbum.posts.map((post, idx) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setSelectedImageIndex(idx)}
                    className="aspect-square bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-all border-2 border-white/10 hover:border-amber-400/50"
                  >
                    <img 
                      src={post.url} 
                      alt={post.caption}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </motion.div>
                ))}
              </div>

              {/* Image Viewer Modal */}
              <AnimatePresence>
                {selectedImageIndex >= 0 && selectedImageIndex < selectedAlbum.posts.length && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedImageIndex(-1)}
                  >
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={(e) => {e.stopPropagation(); prevImage()}}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-amber-500/20 hover:bg-amber-500/40 p-3 rounded-full text-white"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </motion.button>
                    
                    <img 
                      src={selectedAlbum.posts[selectedImageIndex]?.url} 
                      alt={selectedAlbum.posts[selectedImageIndex]?.caption}
                      className="max-w-full max-h-full object-contain"
                      onClick={(e) => e.stopPropagation()}
                    />

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={(e) => {e.stopPropagation(); nextImage()}}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-amber-500/20 hover:bg-amber-500/40 p-3 rounded-full text-white"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => setSelectedImageIndex(-1)}
                      className="absolute top-4 right-4 bg-amber-500/20 hover:bg-amber-500/40 p-2 rounded-full text-white"
                    >
                      <X className="w-6 h-6" />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : viewMode === 'albums' ? (
            /* Albums Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {albums.map((album, idx) => (
                <motion.div
                  key={album.date}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setSelectedAlbum(album)}
                  className="bg-white/5 backdrop-blur-md rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-all border-2 border-white/10 hover:border-amber-400/50 hover:scale-105"
                >
                  <div className="aspect-video bg-white/5 relative">
                    <img 
                      src={album.posts[0]?.url} 
                      alt={album.posts[0]?.caption}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end justify-center pb-4">
                      <div className="text-center text-white">
                        <Grid className="w-10 h-10 mx-auto mb-2" />
                        <p className="text-2xl font-bold">{album.posts.length}</p>
                        <p className="text-xs">photos</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="text-lg font-semibold text-white mb-1">
                      {new Date(album.date).toLocaleDateString('en-US', { 
                        weekday: 'short',
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </h4>
                    <p className="text-xs text-amber-200">
                      {new Date(album.date).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            /* Gallery View - All Photos */
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mediaPosts.map((post, idx) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="aspect-square bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-all border-2 border-white/10 hover:border-amber-400/50 hover:scale-110"
                >
                  <img 
                    src={post.url} 
                    alt={post.caption}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Features Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12"
        >
          <motion.div
            whileHover={{ y: -10, scale: 1.05, rotate: 2 }}
            className="bg-white/5 backdrop-blur-md rounded-xl shadow-lg p-6 text-center hover:shadow-2xl transition-all border-2 border-white/10 hover:border-amber-400/50"
          >
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-4 rounded-full w-fit mx-auto mb-4 shadow-lg">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">Professional Training</h4>
            <p className="text-amber-100 text-sm">Expert coaching for all levels</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -10, scale: 1.05, rotate: -2 }}
            className="bg-white/5 backdrop-blur-md rounded-xl shadow-lg p-6 text-center hover:shadow-2xl transition-all border-2 border-white/10 hover:border-amber-400/50"
          >
            <div className="bg-gradient-to-br from-orange-400 to-red-500 p-4 rounded-full w-fit mx-auto mb-4 shadow-lg">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">Tournament Ready</h4>
            <p className="text-amber-100 text-sm">Prepare for competitions</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -10, scale: 1.05, rotate: 2 }}
            className="bg-white/5 backdrop-blur-md rounded-xl shadow-lg p-6 text-center hover:shadow-2xl transition-all border-2 border-white/10 hover:border-amber-400/50"
          >
            <div className="bg-gradient-to-br from-yellow-400 to-amber-500 p-4 rounded-full w-fit mx-auto mb-4 shadow-lg">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">Championship Quality</h4>
            <p className="text-amber-100 text-sm">Top-notch facilities</p>
          </motion.div>
        </motion.div>

        {/* Footer with Club Information */}
        <footer className="bg-black/50 backdrop-blur-md border-t-2 border-amber-500/30 py-10 mt-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* Manager Info */}
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.05 }}
              >
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-lg w-fit mx-auto mb-2 shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xs font-semibold text-amber-300 mb-1">Club Manager</h4>
                <p className="text-base font-bold text-white">{websiteContent?.manager_name || 'Yahya'}</p>
              </motion.div>

              {/* Director Info */}
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.05 }}
              >
                <div className="bg-gradient-to-br from-orange-500 to-red-600 p-3 rounded-lg w-fit mx-auto mb-2 shadow-lg">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xs font-semibold text-amber-300 mb-1">Club Director</h4>
                <p className="text-base font-bold text-white">{websiteContent?.director_name || 'Kaleem Ullah'}</p>
              </motion.div>

              {/* Location Info */}
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.05 }}
              >
                <div className="bg-gradient-to-br from-yellow-500 to-amber-600 p-3 rounded-lg w-fit mx-auto mb-2 shadow-lg">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xs font-semibold text-amber-300 mb-1">Location</h4>
                <p className="text-base font-bold text-white">{websiteContent?.club_location || 'Star Badminton Club'}</p>
              </motion.div>

              {/* Contact Info */}
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.05 }}
              >
                <div className="bg-gradient-to-br from-amber-600 to-yellow-600 p-3 rounded-lg w-fit mx-auto mb-2 shadow-lg">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xs font-semibold text-amber-300 mb-1">Contact</h4>
                {websiteContent?.contact_email && (
                  <a href={`mailto:${websiteContent.contact_email}`} className="block text-xs text-amber-200 hover:text-white mb-1">
                    {websiteContent.contact_email}
                  </a>
                )}
                {websiteContent?.contact_phone && (
                  <a href={`tel:${websiteContent.contact_phone}`} className="block text-xs text-amber-200 hover:text-white">
                    {websiteContent.contact_phone}
                  </a>
                )}
              </motion.div>
            </div>

            {/* Software Credits */}
            <div className="border-t border-amber-500/20 pt-6 text-center">
              <p className="text-sm text-amber-200 mb-2">
                Developed by Abdul Mueed Khan, 2026. All software control and management are exclusively handled by the Club Manager.
              </p>
              <p className="text-sm text-amber-200">
                © 2024 {websiteContent?.website_name || 'Star Badminton Club'}. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default PublicWebsite