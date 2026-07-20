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
  Sparkles,
  Pin,
  ArrowLeft,
  ExternalLink,
  FileText,
  ImageIcon
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

// Helper function to format time
const formatTime = (time: string): string => {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

interface WebsiteContent {
  id: string
  website_name: string
  logo_url: string
  club_location: string
  location_map_url: string
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
  is_pinned: boolean
  created_at: string
}

interface Post {
  id: string
  title: string
  content: string
  image_url?: string
  is_pinned: boolean
  created_at: string
}

interface GameTiming {
  id: string
  day: string
  start_time: string
  end_time: string
  description: string
  is_active: boolean
}

interface Player {
  id: string
  name: string
  father_name?: string
  email?: string
  address?: string
  about?: string
  picture?: string
  playing_since?: string
  player_code?: string
  description?: string
  created_at: string
}

interface PlayerStar {
  id: string
  player_id: string
  rating: number
}

interface Album {
  date: string
  posts: MediaPost[]
}

function PublicWebsite() {
  const [websiteContent, setWebsiteContent] = useState<WebsiteContent | null>(null)
  const [mediaPosts, setMediaPosts] = useState<MediaPost[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [gameTimings, setGameTimings] = useState<GameTiming | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [playerStars, setPlayerStars] = useState<PlayerStar[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'albums' | 'gallery'>('albums')
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showLanding, setShowLanding] = useState(true)

  useEffect(() => {
    fetchWebsiteData()
    
    const timer = setTimeout(() => {
      setShowLanding(false)
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [])

  const fetchWebsiteData = async () => {
    try {
      const [contentRes, postsRes, mediaRes, timingRes, playersRes, starsRes] = await Promise.all([
        supabase.from('website_content').select('*').single(),
        supabase.from('posts').select('*').order('is_pinned', { ascending: false }).order('created_at', { ascending: false }),
        supabase.from('media_posts').select('*').order('created_at', { ascending: false }),
        supabase.from('game_timings').select('*').eq('is_active', true).single(),
        supabase.from('players').select('*').order('created_at', { ascending: false }),
        supabase.from('player_stars').select('*')
      ])

      if (contentRes.data) setWebsiteContent(contentRes.data)
      if (postsRes.data) setPosts(postsRes.data)
      if (mediaRes.data) {
        setMediaPosts(mediaRes.data)
        const grouped = groupPostsByDate(mediaRes.data)
        setAlbums(grouped)
      }
      if (timingRes.data) setGameTimings(timingRes.data)
      if (playersRes.data) {
        const sortedPlayers = sortPlayersByStars(playersRes.data, starsRes.data || [])
        setPlayers(sortedPlayers)
      }
      if (starsRes.data) setPlayerStars(starsRes.data)
    } catch (error) {
      console.error('Error fetching website data:', error)
    } finally {
      setLoading(false)
    }
  }

  const sortPlayersByStars = (playersList: Player[], stars: PlayerStar[]): Player[] => {
    const starsMap = new Map(stars.map(s => [s.player_id, s.rating]))
    return playersList.sort((a, b) => {
      const starsA = starsMap.get(a.id) || 0
      const starsB = starsMap.get(b.id) || 0
      return starsB - starsA
    })
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

  useEffect(() => {
    if (mediaPosts.length > 0 && !selectedAlbum && !selectedPlayer) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % mediaPosts.length)
      }, 4000)
      return () => clearInterval(timer)
    }
  }, [mediaPosts.length, selectedAlbum, selectedPlayer])

  if (showLanding) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex items-center justify-center z-50">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="text-center"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="w-32 h-32 mx-auto mb-6"
          >
            <BadmintonLogo />
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent mb-4"
          >
            STAR BADMINTON CLUB
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="text-xl text-blue-100 font-medium"
          >
            Dargai
          </motion.p>
        </motion.div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-500 to-blue-700">
        <div className="text-2xl font-bold text-white animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 relative overflow-hidden">
      {/* Animated Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating circles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`circle-${i}`}
            className="absolute rounded-full bg-blue-200/50"
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 50 - 25, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 15 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 2,
            }}
            style={{
              width: `${100 + i * 50}px`,
              height: `${100 + i * 50}px`,
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 30}%`,
            }}
          />
        ))}

        {/* Floating squares */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={`square-${i}`}
            className="absolute rounded-lg bg-blue-300/30"
            animate={{
              y: [0, 40, 0],
              rotate: [0, 180, 360],
              scale: [1, 0.8, 1],
            }}
            transition={{
              duration: 20 + i * 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1.5,
            }}
            style={{
              width: `${60 + i * 20}px`,
              height: `${60 + i * 20}px`,
              left: `${70 + i * 8}%`,
              top: `${10 + i * 25}%`,
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white/90 backdrop-blur-md shadow-xl sticky top-0 z-50 border-b border-blue-200"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between w-full">
            <div className="text-left">
              <motion.h1 
                className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {websiteContent?.website_name || 'Star Badminton Club Dargai'}
              </motion.h1>
              <motion.p 
                className="text-sm text-blue-600 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Excellence in Every Smash
              </motion.p>
            </div>

            <div className="flex items-center gap-6">
              <motion.a
                href={websiteContent?.location_map_url || 'https://maps.google.com/?q=Dargai,Pakistan'}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-2 bg-blue-50 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-blue-200 hover:bg-blue-100 transition-all"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <MapPin className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-700 font-medium">
                  {websiteContent?.club_location || 'Dargai, Pakistan'}
                </span>
                <ExternalLink className="w-3 h-3 text-blue-600" />
              </motion.a>

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

      {/* Hero Section */}
      {mediaPosts.length > 0 && !selectedAlbum && !selectedPlayer && (
        <div className="relative h-[400px] overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800">
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
                  onError={() => handleImageError(mediaPosts[currentSlide].id)}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-800/40 to-cyan-800/40" />
            </motion.div>
          </AnimatePresence>

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
                  <div className="bg-blue-500/80 backdrop-blur-sm p-2 rounded-lg">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-blue-100">
                    {new Date(mediaPosts[currentSlide].date).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </span>
                </motion.div>
                <motion.h2 
                  className="text-3xl sm:text-5xl font-bold leading-tight mb-3 drop-shadow-lg text-white"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {mediaPosts[currentSlide].caption}
                </motion.h2>
                <motion.div 
                  className="h-1 w-20 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                />
              </div>
            </div>
          </motion.div>

          {mediaPosts.length > 1 && (
            <>
              <motion.button 
                onClick={prevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-blue-500/30 hover:bg-blue-500/50 backdrop-blur-sm p-3 rounded-full text-white transition-all border-2 border-blue-400/40"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              <motion.button 
                onClick={nextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-500/30 hover:bg-blue-500/50 backdrop-blur-sm p-3 rounded-full text-white transition-all border-2 border-blue-400/40"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </>
          )}

          {mediaPosts.length > 1 && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2">
              {mediaPosts.map((_, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className="h-2 rounded-full transition-all bg-white"
                  whileHover={{ scale: 1.3 }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content Sections */}
      <div className="container mx-auto px-4 py-12">
        {/* Posts Section */}
        {posts.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">
                Latest Updates
              </h3>
              <p className="text-blue-700 font-medium">Stay informed with the latest news</p>
            </div>
            <div className="space-y-6 max-w-4xl mx-auto">
              {posts.map((post, idx) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-md rounded-xl shadow-lg p-6 border-2 border-blue-500/30 hover:border-blue-400/50 transition-all"
                >
                  <div className="flex items-start gap-3 mb-3">
                    {post.is_pinned && (
                      <div className="bg-amber-500/80 p-2 rounded-lg">
                        <Pin className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">{post.title}</h4>
                      <p className="text-gray-800 leading-relaxed">{post.content}</p>
                      {post.image_url && (
                        <img 
                          src={post.image_url} 
                          alt={post.title}
                          className="mt-4 rounded-lg max-h-96 object-cover w-full"
                          onError={() => handleImageError(post.id)}
                        />
                      )}
                      <span className="text-xs text-gray-600 mt-3 block">
                        {new Date(post.created_at).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Director & Manager Profile Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">
              Club Leadership
            </h3>
            <p className="text-blue-700 font-medium">Meet the team behind Star Badminton Club</p>
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
              <h4 className="text-xl font-bold text-gray-900 mb-1">
                {websiteContent?.director_name || 'Kaleem Ullah'}
              </h4>
              <p className="text-sm text-purple-800 mb-2 font-semibold">Club Director</p>
              <div className="flex items-center justify-center gap-1">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="text-xs text-yellow-700 font-medium">Leading since 2016</span>
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
              <h4 className="text-xl font-bold text-gray-900 mb-1">
                {websiteContent?.manager_name || 'Yahya'}
              </h4>
              <p className="text-sm text-blue-800 mb-2 font-semibold">Club Manager</p>
              <div className="flex items-center justify-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-xs text-yellow-700 font-medium">Managing since 2016</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Game Timing Section */}
        {gameTimings && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-8 border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  Game Timing
                </h3>
              </div>
              <p className="text-base text-gray-800 leading-relaxed font-medium">
                {gameTimings.description || `We play badminton ${gameTimings.day.toLowerCase()} from ${formatTime(gameTimings.start_time)} to ${formatTime(gameTimings.end_time)}.`}
              </p>
            </div>
          </motion.div>
        )}

        {/* Our Players Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">
              Our Players
            </h3>
            <p className="text-blue-700 font-medium">Star-ranked players (highest rated first)</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {players.map((player, idx) => {
              const playerStarRating = playerStars.find(s => s.player_id === player.id)?.rating || 0
              
              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  onClick={() => setSelectedPlayer(player)}
                  className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-md rounded-xl shadow-lg p-6 text-center border-2 border-blue-500/30 hover:border-blue-400/50 transition-all cursor-pointer"
                >
                  <div className="mb-4 flex justify-center">
                    {player.picture && !imageErrors.has(player.id) ? (
                      <img 
                        src={player.picture} 
                        alt={player.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 shadow-lg"
                        onError={() => handleImageError(player.id)}
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center border-4 border-blue-500 shadow-lg">
                        <User className="w-12 h-12 text-white" />
                      </div>
                    )}
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">{player.name}</h4>
                  <div className="flex items-center justify-center gap-1 text-gray-700">
                    {[1, 2, 3, 4, 5].map((star) => <Star key={star} className={`w-4 h-4 ${star <= playerStarRating ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />)}
                  </div>
                  {(player as any).description && (
                    <p className="text-xs text-gray-800 mt-2 line-clamp-2 font-medium">{(player as any).description}</p>
                  )}
                  {player.playing_since && (
                    <span className="text-xs text-blue-800 mt-1 block font-semibold">Since {player.playing_since}</span>
                  )}
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Player Profile Modal */}
        <AnimatePresence>
          {selectedPlayer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto"
              onClick={() => setSelectedPlayer(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="min-h-screen py-12 px-4"
                onClick={(e?: any) => e?.stopPropagation?.()}
              >
                <div className="bg-white rounded-3xl shadow-2xl max-w-4xl mx-auto overflow-hidden">
                  {/* Header with gradient */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
                    
                    {/* Close Button */}
                    <button
                      onClick={() => setSelectedPlayer(null)}
                      className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-full transition-all"
                    >
                      <X className="w-6 h-6" />
                    </button>

                    <div className="relative flex flex-col md:flex-row items-center gap-6">
                      {/* Profile Picture */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="relative"
                      >
                        {selectedPlayer.picture && !imageErrors.has(selectedPlayer.id) ? (
                          <img
                            src={selectedPlayer.picture}
                            alt={selectedPlayer.name}
                            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-2xl"
                            onError={() => handleImageError(selectedPlayer.id)}
                          />
                        ) : (
                          <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white">
                            <User className="w-16 h-16 text-white" />
                          </div>
                        )}
                      </motion.div>

                      {/* Player Info */}
                      <div className="text-center md:text-left flex-1">
                        <motion.h2
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="text-4xl font-bold mb-2"
                        >
                          {selectedPlayer.name}
                        </motion.h2>
                        
                        {selectedPlayer.father_name && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-xl text-blue-100 mb-3"
                          >
                            Son of {selectedPlayer.father_name}
                          </motion.p>
                        )}

                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="flex flex-wrap items-center justify-center md:justify-start gap-3"
                        >
                          {(() => {
                            const playerStarRating = playerStars.find(s => s.player_id === selectedPlayer.id)?.rating || 0
                            return (
                              <>
                                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                                  <Star className="w-4 h-4 text-yellow-300 fill-current" />
                                  <span className="text-sm font-semibold">{playerStarRating}/5</span>
                                </div>
                                {selectedPlayer.playing_since && (
                                  <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-sm">Since {selectedPlayer.playing_since}</span>
                                  </div>
                                )}
                              </>
                            )
                          })()}
                        </motion.div>
                      </div>
                    </div>
                  </div>

                  {/* Player Details */}
                  <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Player Code */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg">
                            <Award className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="font-semibold text-blue-900">Player Code</h3>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 font-mono">{selectedPlayer.player_code || 'N/A'}</p>
                      </motion.div>

                      {/* Member Since */}
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-green-50 rounded-xl p-6 border-2 border-green-200"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-lg">
                            <Calendar className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="font-semibold text-green-900">Member Since</h3>
                        </div>
                        <p className="text-2xl font-bold text-gray-800">
                          {selectedPlayer.created_at ? new Date(selectedPlayer.created_at).toLocaleDateString('en-US', { 
                            month: 'long', 
                            year: 'numeric' 
                          }) : 'N/A'}
                        </p>
                      </motion.div>

                      {/* Email */}
                      {selectedPlayer.email && (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 }}
                          className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-2 rounded-lg">
                              <Mail className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="font-semibold text-purple-900">Email</h3>
                          </div>
                          <a href={`mailto:${selectedPlayer.email}`} className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-2 underline">
                            {selectedPlayer.email}
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </motion.div>
                      )}

                      {/* Address */}
                      {selectedPlayer.address && (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 }}
                          className="bg-orange-50 rounded-xl p-6 border-2 border-orange-200"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-lg">
                              <MapPin className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="font-semibold text-orange-900">Address</h3>
                          </div>
                          <p className="text-gray-800 font-medium">{selectedPlayer.address}</p>
                        </motion.div>
                      )}
                    </div>

                    {/* Description - Full Width */}
                    {(selectedPlayer as any).description && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mt-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="font-semibold text-indigo-900">About Player</h3>
                        </div>
                        <p className="text-gray-800 leading-relaxed font-medium">{(selectedPlayer as any).description}</p>
                      </motion.div>
                    )}

                    {/* Profile Picture */}
                    {selectedPlayer.picture && !imageErrors.has(selectedPlayer.id) && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="mt-6"
                      >
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <ImageIcon className="w-6 h-6 text-blue-600" />
                          Profile Picture
                        </h3>
                        <div className="flex justify-center">
                          <img
                            src={selectedPlayer.picture}
                            alt={selectedPlayer.name}
                            className="max-w-md rounded-2xl shadow-2xl border-4 border-blue-200"
                            onError={() => handleImageError(selectedPlayer.id)}
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Photo Albums Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <motion.h3 
              className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent"
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
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg font-semibold' 
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
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg font-semibold' 
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                }`}
              >
                <List className="w-4 h-4" />
                All Photos
              </motion.button>
            </div>
          </div>

          {selectedAlbum ? (
            <div>
              <motion.button
                whileHover={{ x: -5 }}
                onClick={() => setSelectedAlbum(null)}
                className="flex items-center gap-2 text-blue-300 hover:text-white mb-4 font-medium"
              >
                <ChevronLeft className="w-5 h-5" />
                Back to Albums
              </motion.button>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-md rounded-xl shadow-lg p-6 mb-6 border border-blue-500/20"
              >
                <h4 className="text-2xl font-bold text-white mb-2">
                  {new Date(selectedAlbum.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h4>
                <p className="text-blue-200">{selectedAlbum.posts.length} photos in this album</p>
              </motion.div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {selectedAlbum.posts.map((post, idx) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setSelectedImageIndex(idx)}
                    className="aspect-square bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-all border-2 border-white/10 hover:border-blue-400/50"
                  >
                    <img 
                      src={post.url} 
                      alt={post.caption}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      onError={() => handleImageError(post.id)}
                    />
                  </motion.div>
                ))}
              </div>

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
                      onClick={(e: any) => {e.stopPropagation?.(); prevImage()}}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-blue-500/20 hover:bg-blue-500/40 p-3 rounded-full text-white"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </motion.button>
                    
                    <img 
                      src={selectedAlbum.posts[selectedImageIndex]?.url} 
                      alt={selectedAlbum.posts[selectedImageIndex]?.caption}
                      className="max-w-full max-h-full object-contain"
                      onClick={(e: any) => e.stopPropagation?.()}
                      onError={() => handleImageError(selectedAlbum.posts[selectedImageIndex].id)}
                    />

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={(e: any) => {e.stopPropagation?.(); nextImage()}}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-blue-500/20 hover:bg-blue-500/40 p-3 rounded-full text-white"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => setSelectedImageIndex(-1)}
                      className="absolute top-4 right-4 bg-blue-500/20 hover:bg-blue-500/40 p-2 rounded-full text-white"
                    >
                      <X className="w-6 h-6" />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : viewMode === 'albums' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {albums.map((album, idx) => (
                <motion.div
                  key={album.date}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setSelectedAlbum(album)}
                  className="bg-white/5 backdrop-blur-md rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-all border-2 border-white/10 hover:border-blue-400/50 hover:scale-105"
                >
                  <div className="aspect-video bg-white/5 relative">
                    <img 
                      src={album.posts[0]?.url} 
                      alt={album.posts[0]?.caption}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(album.posts[0]?.id)}
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
                    <p className="text-xs text-blue-200">
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mediaPosts.map((post, idx) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => {
                    const album = albums.find(a => a.posts.some(p => p.id === post.id))
                    if (album) {
                      setSelectedAlbum(album)
                      setSelectedImageIndex(album.posts.findIndex(p => p.id === post.id))
                    }
                  }}
                  className="aspect-square bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-all border-2 border-white/10 hover:border-blue-400/50 hover:scale-110"
                >
                  <img 
                    src={post.url} 
                    alt={post.caption}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(post.id)}
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
            className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6 text-center hover:shadow-2xl transition-all border-2 border-blue-200 hover:border-blue-400"
          >
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-4 rounded-full w-fit mx-auto mb-4 shadow-lg">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Professional Training</h4>
            <p className="text-gray-600 text-sm">Expert coaching for all levels</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -10, scale: 1.05, rotate: -2 }}
            className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6 text-center hover:shadow-2xl transition-all border-2 border-blue-200 hover:border-blue-400"
          >
            <div className="bg-gradient-to-br from-cyan-400 to-blue-600 p-4 rounded-full w-fit mx-auto mb-4 shadow-lg">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Tournament Ready</h4>
            <p className="text-gray-600 text-sm">Prepare for competitions</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -10, scale: 1.05, rotate: 2 }}
            className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6 text-center hover:shadow-2xl transition-all border-2 border-blue-200 hover:border-blue-400"
          >
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-full w-fit mx-auto mb-4 shadow-lg">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Championship Quality</h4>
            <p className="text-gray-600 text-sm">Top-notch facilities</p>
          </motion.div>
        </motion.div>

        {/* Footer with Club Information */}
        <footer className="bg-white/80 backdrop-blur-md border-t-2 border-blue-200 py-10 mt-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.05 }}
              >
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg w-fit mx-auto mb-2 shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xs font-semibold text-blue-600 mb-1">Club Manager</h4>
                <p className="text-base font-bold text-gray-800">{websiteContent?.manager_name || 'Yahya'}</p>
              </motion.div>

              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.05 }}
              >
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-lg w-fit mx-auto mb-2 shadow-lg">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xs font-semibold text-blue-600 mb-1">Club Director</h4>
                <p className="text-base font-bold text-gray-800">{websiteContent?.director_name || 'Kaleem Ullah'}</p>
              </motion.div>

              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.05 }}
              >
                <div className="bg-gradient-to-br from-blue-400 to-cyan-600 p-3 rounded-lg w-fit mx-auto mb-2 shadow-lg">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xs font-semibold text-blue-600 mb-1">Location</h4>
                <p className="text-base font-bold text-gray-800">{websiteContent?.club_location || 'Dargai, Pakistan'}</p>
              </motion.div>

              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.05 }}
              >
                <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-3 rounded-lg w-fit mx-auto mb-2 shadow-lg">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xs font-semibold text-blue-600 mb-1">Contact</h4>
                {websiteContent?.contact_email && (
                  <a href={`mailto:${websiteContent.contact_email}`} className="block text-xs text-blue-500 hover:text-blue-700 mb-1">
                    {websiteContent.contact_email}
                  </a>
                )}
                {websiteContent?.contact_phone && (
                  <a href={`tel:${websiteContent.contact_phone}`} className="block text-xs text-blue-500 hover:text-blue-700">
                    {websiteContent.contact_phone}
                  </a>
                )}
              </motion.div>
            </div>

            <div className="border-t border-blue-200 pt-6 text-center">
              <p className="text-sm text-blue-600 mb-2">
                Developed by Abdul Mueed Khan, 2026. All software control and management are exclusively handled by the Club Manager.
              </p>
              <p className="text-sm text-blue-600">
                © 2024 {websiteContent?.website_name || 'Star Badminton Club Dargai'}. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default PublicWebsite