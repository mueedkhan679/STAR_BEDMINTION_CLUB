import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trash2, 
  Edit2, 
  Plus, 
  X, 
  Image as ImageIcon, 
  Video,
  Globe,
  User,
  MapPin,
  Bell,
  Mail,
  Phone,
  Camera
} from 'lucide-react'
import toast from 'react-hot-toast'

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

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'urgent'
  is_active: boolean
  created_at: string
}

type TabType = 'content' | 'media' | 'notifications'

function WebsiteManagement() {
  const [websiteContent, setWebsiteContent] = useState<WebsiteContent | null>(null)
  const [mediaPosts, setMediaPosts] = useState<MediaPost[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('content')
  
  const [editingContent, setEditingContent] = useState(false)
  const [showMediaModal, setShowMediaModal] = useState(false)
  const [editingMedia, setEditingMedia] = useState<MediaPost | null>(null)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null)
  const [uploading, setUploading] = useState(false)

  const [contentForm, setContentForm] = useState({
    website_name: '',
    logo_url: '',
    club_location: '',
    manager_name: '',
    director_name: '',
    contact_email: '',
    contact_phone: '',
    manager_profile_url: '',
    director_profile_url: ''
  })

  const [mediaForm, setMediaForm] = useState({
    type: 'image' as 'image' | 'video',
    url: '',
    caption: '',
    date: ''
  })
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'success' | 'urgent',
    is_active: true
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [contentRes, postsRes, notificationsRes] = await Promise.all([
        supabase.from('website_content').select('*').single(),
        supabase.from('media_posts').select('*').order('created_at', { ascending: false }),
        supabase.from('notifications').select('*').order('created_at', { ascending: false })
      ])

      if (contentRes.data) {
        setWebsiteContent(contentRes.data)
        setContentForm({
          website_name: contentRes.data.website_name,
          logo_url: contentRes.data.logo_url || '',
          club_location: contentRes.data.club_location,
          manager_name: contentRes.data.manager_name,
          director_name: contentRes.data.director_name,
          contact_email: contentRes.data.contact_email || '',
          contact_phone: contentRes.data.contact_phone || '',
          manager_profile_url: contentRes.data.manager_profile_url || '',
          director_profile_url: contentRes.data.director_profile_url || ''
        })
      }
      if (postsRes.data) setMediaPosts(postsRes.data)
      if (notificationsRes.data) setNotifications(notificationsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveContent = async () => {
    try {
      console.log('Attempting to save content:', contentForm)
      console.log('Website content ID:', websiteContent?.id)

      // Force update by using a different approach
      const updateData = {
        ...contentForm,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('website_content')
        .update(updateData)
        .eq('id', websiteContent?.id)
        .select()

      console.log('Update response:', { data, error })

      if (error) {
        console.error('Update error:', error)
        throw error
      }

      // Even if no data returned, the update might have succeeded
      console.log('Content saved successfully')
      toast.success('Website content updated successfully')
      setEditingContent(false)
      
      // Wait a bit then refresh data
      setTimeout(() => {
        fetchData()
      }, 500)
    } catch (error: any) {
      console.error('Error updating content:', error)
      toast.error(error.message || 'Failed to update content')
    }
  }

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  const handleProfilePictureUpload = async (type: 'manager' | 'director', file: File) => {
    try {
      setUploading(true)
      const base64 = await convertFileToBase64(file)
      
      const updateData: any = {}
      if (type === 'manager') {
        updateData.manager_profile_url = base64
      } else {
        updateData.director_profile_url = base64
      }
      
      updateData.updated_at = new Date().toISOString()

      const { error } = await supabase
        .from('website_content')
        .update(updateData)
        .eq('id', websiteContent?.id)

      if (error) throw error
      toast.success(`${type === 'manager' ? 'Manager' : 'Director'} profile picture updated successfully!`)
      fetchData()
    } catch (error: any) {
      console.error('Error uploading profile picture:', error)
      toast.error(error.message || 'Failed to upload profile picture')
    } finally {
      setUploading(false)
    }
  }

  const handleUploadMedia = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setUploading(true)

      if (editingMedia && selectedFiles.length === 0) {
        const { error } = await supabase
          .from('media_posts')
          .update(mediaForm)
          .eq('id', editingMedia.id)

        if (error) throw error
        toast.success('Media updated successfully')
        setShowMediaModal(false)
        setEditingMedia(null)
        setSelectedFiles([])
        setMediaForm({ type: 'image', url: '', caption: '', date: '' })
        fetchData()
        return
      }

      const base64Promises = selectedFiles.map(async (file) => {
        const base64 = await convertFileToBase64(file)
        return base64
      })

      const base64Urls = await Promise.all(base64Promises)

      const mediaPostsToInsert = base64Urls.map(url => ({
        ...mediaForm,
        url: url
      }))

      const { error } = await supabase
        .from('media_posts')
        .insert(mediaPostsToInsert)

      if (error) throw error
      toast.success(`${base64Urls.length} media file(s) uploaded successfully!`)

      setShowMediaModal(false)
      setEditingMedia(null)
      setSelectedFiles([])
      setMediaForm({ type: 'image', url: '', caption: '', date: '' })
      fetchData()
    } catch (error: any) {
      console.error('Error saving media:', error)
      toast.error(error.message || 'Failed to save media')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteMedia = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return

    try {
      const { error } = await supabase
        .from('media_posts')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Media deleted successfully')
      fetchData()
    } catch (error) {
      toast.error('Failed to delete media')
    }
  }

  const openEditMedia = (post: MediaPost) => {
    setEditingMedia(post)
    setMediaForm({
      type: post.type,
      url: post.url,
      caption: post.caption,
      date: post.date
    })
    setShowMediaModal(true)
  }

  const handleSaveNotification = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingNotification) {
        const { error } = await supabase
          .from('notifications')
          .update(notificationForm)
          .eq('id', editingNotification.id)

        if (error) throw error
        toast.success('Notification updated successfully')
      } else {
        const { error } = await supabase
          .from('notifications')
          .insert([notificationForm])

        if (error) throw error
        toast.success('Notification created successfully')
      }

      setShowNotificationModal(false)
      setEditingNotification(null)
      setNotificationForm({ title: '', message: '', type: 'info', is_active: true })
      fetchData()
    } catch (error) {
      console.error('Error saving notification:', error)
      toast.error('Failed to save notification')
    }
  }

  const handleDeleteNotification = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) return

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Notification deleted successfully')
      fetchData()
    } catch (error) {
      toast.error('Failed to delete notification')
    }
  }

  const openEditNotification = (notification: Notification) => {
    setEditingNotification(notification)
    setNotificationForm({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      is_active: notification.is_active
    })
    setShowNotificationModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-1 sm:mb-2">Website Management</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Manage your public website content</p>
        </div>
        <a
          href="/public-website"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-semibold text-sm sm:text-base"
        >
          <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
          View Website
        </a>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('content')}
            className={`pb-3 px-2 font-medium transition-colors ${
              activeTab === 'content'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            Manager & Director
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`pb-3 px-2 font-medium transition-colors ${
              activeTab === 'media'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <ImageIcon className="w-4 h-4 inline mr-2" />
            Pictures & Videos
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`pb-3 px-2 font-medium transition-colors ${
              activeTab === 'notifications'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Bell className="w-4 h-4 inline mr-2" />
            Notifications
          </button>
        </nav>
      </div>

      {/* Content Tab */}
      {activeTab === 'content' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg p-4 sm:p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-2 rounded-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Website Information</h2>
            </div>
            <button
              onClick={() => setEditingContent(!editingContent)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {editingContent ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
              {editingContent ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editingContent ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Website Name</label>
                <input
                  type="text"
                  value={contentForm.website_name}
                  onChange={(e) => setContentForm({ ...contentForm, website_name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Logo URL</label>
                <input
                  type="text"
                  value={contentForm.logo_url}
                  onChange={(e) => setContentForm({ ...contentForm, logo_url: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Club Location</label>
                <input
                  type="text"
                  value={contentForm.club_location}
                  onChange={(e) => setContentForm({ ...contentForm, club_location: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Manager Name</label>
                  <input
                    type="text"
                    value={contentForm.manager_name}
                    onChange={(e) => setContentForm({ ...contentForm, manager_name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Director Name</label>
                  <input
                    type="text"
                    value={contentForm.director_name}
                    onChange={(e) => setContentForm({ ...contentForm, director_name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contact Email</label>
                  <input
                    type="email"
                    value={contentForm.contact_email}
                    onChange={(e) => setContentForm({ ...contentForm, contact_email: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contact Phone</label>
                  <input
                    type="text"
                    value={contentForm.contact_phone}
                    onChange={(e) => setContentForm({ ...contentForm, contact_phone: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Profile Pictures */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                {/* Manager Profile Picture */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Manager Profile Picture
                  </label>
                  <div className="flex flex-col items-center gap-3">
                    {contentForm.manager_profile_url && (
                      <img 
                        src={contentForm.manager_profile_url} 
                        alt="Manager" 
                        className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-lg"
                      />
                    )}
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleProfilePictureUpload('manager', file)
                          }
                        }}
                      />
                      <div className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        <Camera className="w-4 h-4" />
                        {contentForm.manager_profile_url ? 'Change Photo' : 'Upload Photo'}
                      </div>
                    </label>
                    {contentForm.manager_profile_url && (
                      <button
                        type="button"
                        onClick={async () => {
                          if (!confirm('Remove manager profile picture?')) return
                          const { error } = await supabase
                            .from('website_content')
                            .update({ manager_profile_url: null, updated_at: new Date().toISOString() })
                            .eq('id', websiteContent?.id)
                          if (error) {
                            toast.error('Failed to remove photo')
                            return
                          }
                          toast.success('Manager profile picture removed')
                          fetchData()
                        }}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                </div>

                {/* Director Profile Picture */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Director Profile Picture
                  </label>
                  <div className="flex flex-col items-center gap-3">
                    {contentForm.director_profile_url && (
                      <img 
                        src={contentForm.director_profile_url} 
                        alt="Director" 
                        className="w-32 h-32 rounded-full object-cover border-4 border-purple-500 shadow-lg"
                      />
                    )}
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleProfilePictureUpload('director', file)
                          }
                        }}
                      />
                      <div className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                        <Camera className="w-4 h-4" />
                        {contentForm.director_profile_url ? 'Change Photo' : 'Upload Photo'}
                      </div>
                    </label>
                    {contentForm.director_profile_url && (
                      <button
                        type="button"
                        onClick={async () => {
                          if (!confirm('Remove director profile picture?')) return
                          const { error } = await supabase
                            .from('website_content')
                            .update({ director_profile_url: null, updated_at: new Date().toISOString() })
                            .eq('id', websiteContent?.id)
                          if (error) {
                            toast.error('Failed to remove photo')
                            return
                          }
                          toast.success('Director profile picture removed')
                          fetchData()
                        }}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveContent}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-semibold"
              >
                Save Changes
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Website Name</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">{websiteContent?.website_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Club Location</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">{websiteContent?.club_location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manager</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">{websiteContent?.manager_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Director</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">{websiteContent?.director_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Contact Email</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">{websiteContent?.contact_email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Contact Phone</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">{websiteContent?.contact_phone}</p>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Media Tab */}
      {activeTab === 'media' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg p-4 sm:p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-500 p-2 rounded-lg">
                <ImageIcon className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Pictures & Videos</h2>
            </div>
            <button
              onClick={() => {
                setEditingMedia(null)
                setMediaForm({ type: 'image', url: '', caption: '', date: '' })
                setShowMediaModal(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Media
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mediaPosts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden shadow-md"
              >
                <div className="aspect-video bg-gray-200 dark:bg-gray-600 relative">
                  {post.type === 'image' ? (
                    <img src={post.url} alt={post.caption} className="w-full h-full object-cover" />
                  ) : (
                    <video src={post.url} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
                    {post.type === 'image' ? <ImageIcon className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                    {post.type}
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{post.caption}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(post.date).toLocaleDateString()}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditMedia(post)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMedia(post.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg p-4 sm:p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 p-2 rounded-lg">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Notifications</h2>
            </div>
            <button
              onClick={() => {
                setEditingNotification(null)
                setNotificationForm({ title: '', message: '', type: 'info', is_active: true })
                setShowNotificationModal(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Notification
            </button>
          </div>

          <div className="space-y-4">
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 sm:p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                        notification.type === 'urgent' ? 'bg-red-100 text-red-800' :
                        notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        notification.type === 'success' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {notification.type.toUpperCase()}
                      </span>
                      {notification.is_active && (
                        <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-green-100 text-green-800">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                      {notification.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {notification.message}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => openEditNotification(notification)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Media Upload/Edit Modal */}
      <AnimatePresence>
        {showMediaModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowMediaModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  {editingMedia ? 'Edit Media' : 'Add New Media'}
                </h3>
                <button onClick={() => setShowMediaModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleUploadMedia} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                  <select
                    value={mediaForm.type}
                    onChange={(e) => setMediaForm({ ...mediaForm, type: e.target.value as 'image' | 'video' })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Upload {mediaForm.type === 'image' ? 'Images' : 'Videos'} (Multiple allowed)
                  </label>
                  <input
                    type="file"
                    accept={mediaForm.type === 'image' ? 'image/*' : 'video/*'}
                    onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                    multiple
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required={!editingMedia}
                  />
                  {selectedFiles.length > 0 && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                      Selected {selectedFiles.length} file(s)
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Caption</label>
                  <textarea
                    value={mediaForm.caption}
                    onChange={(e) => setMediaForm({ ...mediaForm, caption: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date</label>
                  <input
                    type="date"
                    value={mediaForm.date}
                    onChange={(e) => setMediaForm({ ...mediaForm, date: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowMediaModal(false)}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"
                  >
                    {uploading ? 'Saving...' : editingMedia ? 'Update' : 'Add Media'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Modal */}
      <AnimatePresence>
        {showNotificationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowNotificationModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  {editingNotification ? 'Edit Notification' : 'Add New Notification'}
                </h3>
                <button onClick={() => setShowNotificationModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSaveNotification} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
                  <input
                    type="text"
                    value={notificationForm.title}
                    onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
                  <textarea
                    value={notificationForm.message}
                    onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                  <select
                    value={notificationForm.type}
                    onChange={(e) => setNotificationForm({ ...notificationForm, type: e.target.value as any })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="success">Success</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={notificationForm.is_active}
                    onChange={(e) => setNotificationForm({ ...notificationForm, is_active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="is_active" className="text-sm text-gray-700 dark:text-gray-300">
                    Active (show on website)
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNotificationModal(false)}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
                  >
                    {editingNotification ? 'Update' : 'Add Notification'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default WebsiteManagement