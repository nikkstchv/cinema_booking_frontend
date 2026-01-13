import type { Movie } from '~/shared/schemas'
import { APP_ROUTES } from '~/shared/lib/app-routes'

export function useSessionSEO(sessionId: Ref<number>, movie: Ref<Movie | undefined>) {
  const baseUrl = useBaseUrl()

  const canonicalUrl = computed(() => `${baseUrl.value}${APP_ROUTES.SESSIONS.DETAIL(sessionId.value)}`)

  useHead({
    title: () => movie.value
      ? `Бронирование - ${movie.value.title} - CinemaBook`
      : 'Бронирование - CinemaBook',
    meta: [
      {
        name: 'description',
        content: () => movie.value ? `Бронирование билетов на фильм ${movie.value.title}` : 'Бронирование билетов в кинотеатр'
      },
      { name: 'robots', content: 'noindex, nofollow' }
    ],
    link: [
      { rel: 'canonical', href: () => canonicalUrl.value }
    ]
  })
}
