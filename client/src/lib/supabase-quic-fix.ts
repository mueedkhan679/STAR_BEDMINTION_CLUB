import { createClient } from '@supabase/supabase-js'

// Force HTTP/1.1 to avoid QUIC protocol errors
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your-project-url'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'star-badminton-club',
    },
  },
  // Force HTTP/1.1 to avoid QUIC errors
  fetch: (url, options = {}) => {
    return fetch(url, {
      ...options,
      // Force HTTP/1.1 by setting the header
      headers: {
        ...options.headers,
        'Connection': 'close', // Forces HTTP/1.1 instead of HTTP/2/QUIC
      },
    })
  },
})

export default supabase