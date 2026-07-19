import { useEffect } from 'react'

function SitemapPage() {
  useEffect(() => {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://star-bedmintion-club-kjvw.vercel.app/</loc>
    <lastmod>2026-07-18</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://star-bedmintion-club-kjvw.vercel.app/public-website</loc>
    <lastmod>2026-07-18</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`

    // Set the content type to XML
    document.open('text/xml')
    document.write(sitemap)
    document.close()
  }, [])

  return null
}

export default SitemapPage