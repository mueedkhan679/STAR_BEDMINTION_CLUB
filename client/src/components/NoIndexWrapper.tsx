import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

interface NoIndexWrapperProps {
  children: React.ReactNode
}

function NoIndexWrapper({ children }: NoIndexWrapperProps) {
  const location = useLocation()

  useEffect(() => {
    // Add noindex meta tag to prevent search engines from indexing admin pages
    const metaTag = document.createElement('meta')
    metaTag.name = 'robots'
    metaTag.content = 'noindex, nofollow'
    document.head.appendChild(metaTag)

    // Also add Google-specific noindex
    const googleMetaTag = document.createElement('meta')
    googleMetaTag.name = 'googlebot'
    googleMetaTag.content = 'noindex, nofollow'
    document.head.appendChild(googleMetaTag)

    // Cleanup function to remove tags when component unmounts
    return () => {
      document.head.removeChild(metaTag)
      document.head.removeChild(googleMetaTag)
    }
  }, [])

  return <>{children}</>
}

export default NoIndexWrapper