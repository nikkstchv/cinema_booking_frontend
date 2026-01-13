import type { Movie } from '~/shared/schemas'
import { APP_ROUTES } from '~/shared/lib/app-routes'
import { getFullPosterUrl } from '~/shared/lib/formatters'
import { MIME_TYPES } from '~/shared/lib/mime-types'

export function useMovieSEO(movieId: Ref<number>, movie: Ref<Movie | undefined>) {
  const baseUrl = useBaseUrl()
  const config = useRuntimeConfig()

  const canonicalUrl = computed(() => `${baseUrl.value}${APP_ROUTES.MOVIES.DETAIL(movieId.value)}`)
  const ogImageUrl = computed(() =>
    movie.value ? getFullPosterUrl(movie.value.posterImage, config.public.apiBase) : ''
  )

  useHead({
    title: () => movie.value ? `${movie.value.title} - CinemaBook` : 'Загрузка...',
    meta: [
      {
        name: 'description',
        content: () => movie.value?.description || 'Информация о фильме и доступные сеансы'
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: () => movie.value?.title || 'CinemaBook' },
      {
        property: 'og:description',
        content: () => movie.value?.description || 'Информация о фильме и доступные сеансы'
      },
      { property: 'og:image', content: () => ogImageUrl.value },
      { property: 'og:url', content: () => canonicalUrl.value },
      { property: 'og:site_name', content: 'CinemaBook' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: () => movie.value?.title || 'CinemaBook' },
      {
        name: 'twitter:description',
        content: () => movie.value?.description || 'Информация о фильме и доступные сеансы'
      },
      { name: 'twitter:image', content: () => ogImageUrl.value }
    ],
    link: [
      { rel: 'canonical', href: () => canonicalUrl.value },
      ...(movie.value
        ? [{ rel: 'preload', as: 'image' as const, href: () => ogImageUrl.value }]
        : [])
    ]
  })

  useHead({
    script: computed(() =>
      movie.value
        ? [
            {
              type: MIME_TYPES.JSON,
              innerHTML: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Movie',
                'name': movie.value.title,
                'description': movie.value.description,
                'dateCreated': movie.value.year.toString(),
                'aggregateRating': {
                  '@type': 'AggregateRating',
                  'ratingValue': movie.value.rating,
                  'bestRating': 10
                }
              })
            },
            {
              type: MIME_TYPES.JSON,
              innerHTML: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                'itemListElement': [
                  {
                    '@type': 'ListItem',
                    'position': 1,
                    'name': 'Фильмы',
                    'item': `${baseUrl.value}${APP_ROUTES.MOVIES.INDEX}`
                  },
                  {
                    '@type': 'ListItem',
                    'position': 2,
                    'name': movie.value.title,
                    'item': canonicalUrl.value
                  }
                ]
              })
            }
          ]
        : []
    )
  })
}
