import type { Cinema } from '~/shared/schemas'
import { APP_ROUTES } from '~/shared/lib/app-routes'
import { MIME_TYPES } from '~/shared/lib/mime-types'

export function useCinemaSEO(cinemaId: Ref<number>, cinema: Ref<Cinema | undefined>) {
  const baseUrl = useBaseUrl()

  const canonicalUrl = computed(() => `${baseUrl.value}${APP_ROUTES.CINEMAS.DETAIL(cinemaId.value)}`)

  useHead({
    title: () => cinema.value ? `${cinema.value.name} - CinemaBook` : 'Загрузка...',
    meta: [
      {
        name: 'description',
        content: () =>
          cinema.value
            ? `Кинотеатр ${cinema.value.name}. Адрес: ${cinema.value.address}. Расписание сеансов.`
            : 'Информация о кинотеатре и расписание сеансов'
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: () => cinema.value ? `${cinema.value.name} - CinemaBook` : 'CinemaBook' },
      {
        property: 'og:description',
        content: () =>
          cinema.value
            ? `Кинотеатр ${cinema.value.name}. Адрес: ${cinema.value.address}. Расписание сеансов.`
            : 'Информация о кинотеатре и расписание сеансов'
      },
      { property: 'og:url', content: () => canonicalUrl.value },
      { property: 'og:site_name', content: 'CinemaBook' },
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:title', content: () => cinema.value ? `${cinema.value.name} - CinemaBook` : 'CinemaBook' },
      {
        name: 'twitter:description',
        content: () =>
          cinema.value ? `Кинотеатр ${cinema.value.name}. Адрес: ${cinema.value.address}.` : 'Информация о кинотеатре'
      }
    ],
    link: [
      { rel: 'canonical', href: () => canonicalUrl.value }
    ]
  })

  useHead({
    script: computed(() =>
      cinema.value
        ? [
            {
              type: MIME_TYPES.JSON,
              innerHTML: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'MovieTheater',
                'name': cinema.value.name,
                'address': {
                  '@type': 'PostalAddress',
                  'streetAddress': cinema.value.address
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
                    'name': 'Кинотеатры',
                    'item': `${baseUrl.value}${APP_ROUTES.CINEMAS.INDEX}`
                  },
                  {
                    '@type': 'ListItem',
                    'position': 2,
                    'name': cinema.value.name,
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
