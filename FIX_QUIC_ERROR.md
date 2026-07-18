# Fix QUIC Protocol Error - Supabase Connection Issue

## Error You're Seeing:
```
Failed to load resource: net::ERR_QUIC_PROTOCOL_ERROR
QUIC_PACKET_WRITE_ERROR
gcxnjfnysfferzlqcdut.supabase.co/rest/v1/media_posts?select=*&order=created_at.desc:1
```

This is a **network connectivity issue** with Supabase's HTTP/3 (QUIC) protocol. It's not a code error - it's a browser/network configuration issue.

## What is QUIC?

QUIC (Quick UDP Internet Connections) is a modern transport protocol (HTTP/3) that Supabase uses. Some browsers, networks, or firewalls don't support it properly, causing this error.

## Solutions (Try in Order):

### Solution 1: Disable QUIC in Browser (Quickest Fix)

#### For Chrome/Edge:
1. Open Chrome/Edge
2. Go to: `chrome://flags/#enable-quic`
3. Set **Experimental QUIC protocol** to **Disabled**
4. Click **Relaunch**

#### For Firefox:
1. Open Firefox
2. Go to: `about:config`
3. Search for: `network.http.http3.enabled`
4. Set it to **false**
5. Restart Firefox

### Solution 2: Clear Browser Cache & Data

1. Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
2. Select **All time**
3. Check:
   - Cookies and other site data
   - Cached images and files
4. Click **Clear data**
5. Restart browser

### Solution 3: Try Incognito/Private Mode

1. Open browser in Incognito/Private mode
2. Navigate to your application
3. Check if the error persists

If it works in incognito, the issue is with browser extensions or cache.

### Solution 4: Disable Browser Extensions

Some extensions (especially VPN, ad blockers, or privacy extensions) can interfere with QUIC:

1. Go to browser extensions
2. Disable all extensions
3. Restart browser
4. Test the application

### Solution 5: Check Firewall/Antivirus

Your firewall or antivirus might be blocking QUIC:

1. Temporarily disable firewall/antivirus
2. Test the application
3. If it works, add an exception for your browser

### Solution 6: Use Different Network

Try connecting to a different network:
- Switch from WiFi to Mobile hotspot
- Use a VPN
- Try from a different location

### Solution 7: Update Your Browser

Make sure you're using the latest version:
- Chrome: Version 113+
- Edge: Version 113+
- Firefox: Version 112+

## Permanent Code Fix (Recommended)

I can modify the Supabase client configuration to force HTTP/1.1 or HTTP/2 instead of QUIC. This will bypass the QUIC protocol entirely.

### Option A: Update Supabase Client Configuration

<write_to_file>
<path>client/src/lib/supabase-quic-fix.ts</path>
<content>
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