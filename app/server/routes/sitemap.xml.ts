export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiBase || 'http://localhost:3022'
  const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://yourdomain.com'

  const routes: string[] = [
    `${siteUrl}/movies`,
    `${siteUrl}/cinemas`
  ]

  try {
    const [moviesRes, cinemasRes] = await Promise.all([
      fetch(`${baseUrl}/api/movies`).catch(() => null),
      fetch(`${baseUrl}/api/cinemas`).catch(() => null)
    ])

    if (moviesRes?.ok) {
      const movies = await moviesRes.json()
      routes.push(...movies.map((m: { id: number }) => `${siteUrl}/movies/${m.id}`))
    }

    if (cinemasRes?.ok) {
      const cinemas = await cinemasRes.json()
      routes.push(...cinemas.map((c: { id: number }) => `${siteUrl}/cinemas/${c.id}`))
    }
  } catch (error) {
    console.error('Error fetching sitemap routes:', error)
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(url => `  <url>
    <loc>${url}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`

  event.node.res.setHeader('Content-Type', 'application/xml')
  return sitemap
})

