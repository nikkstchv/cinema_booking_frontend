import { logger } from '~/shared/lib/logger'
import { MIME_TYPES } from '~/shared/lib/mime-types'
import { APP_ROUTES } from '~/shared/lib/app-routes'
import { API_ENDPOINTS } from '~/shared/lib/api-endpoints'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiBase || 'http://localhost:3022'
  const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://yourdomain.com'

  const routes: string[] = [
    `${siteUrl}${APP_ROUTES.MOVIES.INDEX}`,
    `${siteUrl}${APP_ROUTES.CINEMAS.INDEX}`
  ]

  try {
    const [moviesRes, cinemasRes] = await Promise.all([
      fetch(`${baseUrl}${API_ENDPOINTS.MOVIES.ALL}`).catch(() => null),
      fetch(`${baseUrl}${API_ENDPOINTS.CINEMAS.ALL}`).catch(() => null)
    ])

    if (moviesRes?.ok) {
      const movies = await moviesRes.json()
      routes.push(...movies.map((movie: { id: number }) => `${siteUrl}${APP_ROUTES.MOVIES.DETAIL(movie.id)}`))
    }

    if (cinemasRes?.ok) {
      const cinemas = await cinemasRes.json()
      routes.push(...cinemas.map((cinema: { id: number }) => `${siteUrl}${APP_ROUTES.CINEMAS.DETAIL(cinema.id)}`))
    }
  } catch (error) {
    logger.error('Error fetching sitemap routes:', error)
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(url => `  <url>
    <loc>${url}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`

  event.node.res.setHeader('Content-Type', MIME_TYPES.XML)
  return sitemap
})
