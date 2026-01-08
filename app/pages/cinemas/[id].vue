<script setup lang="ts">
import CinemaSessionsTable from '~/features/cinemas/components/CinemaSessionsTable.vue'
import { useCinemas, useCinemaSessions } from '~/features/cinemas/composables/useCinemas'
import { useMovies } from '~/features/movies/composables/useMovies'

const route = useRoute()
const { handleError } = useErrorHandler()

const cinemaId = computed(() => Number(route.params.id))

// Fetch data
const { data: cinemas, isLoading: cinemasLoading, error: cinemasError } = useCinemas()
const { data: sessions, isLoading: sessionsLoading, error: sessionsError } = useCinemaSessions(cinemaId)
const { data: movies, isLoading: moviesLoading } = useMovies()

// Find current cinema
const cinema = computed(() => cinemas.value?.find(c => c.id === cinemaId.value))

const config = useRuntimeConfig()

const baseUrl = computed(() => {
  if (process.client) {
    return window.location.origin
  }
  return config.public.apiBase.replace('/api', '') || 'http://localhost:3000'
})

const canonicalUrl = computed(() => `${baseUrl.value}/cinemas/${cinemaId.value}`)

useHead({
  title: () => cinema.value ? `${cinema.value.name} - CinemaBook` : 'Загрузка...',
  meta: [
    { name: 'description', content: () => cinema.value ? `Кинотеатр ${cinema.value.name}. Адрес: ${cinema.value.address}. Расписание сеансов.` : 'Информация о кинотеатре и расписание сеансов' },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: () => cinema.value ? `${cinema.value.name} - CinemaBook` : 'CinemaBook' },
    { property: 'og:description', content: () => cinema.value ? `Кинотеатр ${cinema.value.name}. Адрес: ${cinema.value.address}. Расписание сеансов.` : 'Информация о кинотеатре и расписание сеансов' },
    { property: 'og:url', content: () => canonicalUrl.value },
    { property: 'og:site_name', content: 'CinemaBook' },
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: () => cinema.value ? `${cinema.value.name} - CinemaBook` : 'CinemaBook' },
    { name: 'twitter:description', content: () => cinema.value ? `Кинотеатр ${cinema.value.name}. Адрес: ${cinema.value.address}.` : 'Информация о кинотеатре' }
  ],
  link: [
    { rel: 'canonical', href: () => canonicalUrl.value }
  ]
})

useHead({
  script: computed(() => cinema.value
    ? [
        {
          type: 'application/ld+json',
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
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            'itemListElement': [
              {
                '@type': 'ListItem',
                'position': 1,
                'name': 'Кинотеатры',
                'item': `${baseUrl.value}/cinemas`
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
    : [])
})

// Handle errors
watch([cinemasError, sessionsError], ([cErr, sErr]) => {
  if (cErr) handleError(cErr)
  if (sErr) handleError(sErr)
})

// 404 if cinema not found
watch([cinemas, cinemasLoading], ([c, loading]) => {
  if (!loading && c && !cinema.value) {
    throw createError({
      statusCode: 404,
      message: 'Кинотеатр не найден'
    })
  }
})

const isLoading = computed(() => cinemasLoading.value || moviesLoading.value)
</script>

<template>
  <div>
    <!-- Back button -->
    <NuxtLink
      to="/cinemas"
      class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
    >
      <UIcon
        name="i-lucide-arrow-left"
        class="w-4 h-4"
      />
      Назад к кинотеатрам
    </NuxtLink>

    <!-- Loading -->
    <div
      v-if="isLoading"
      class="space-y-6"
    >
      <div class="flex items-center gap-4">
        <USkeleton class="w-16 h-16 rounded-lg" />
        <div class="space-y-2">
          <USkeleton class="h-8 w-48" />
          <USkeleton class="h-5 w-64" />
        </div>
      </div>
      <USkeleton class="h-48 w-full" />
    </div>

    <!-- Cinema details -->
    <template v-else-if="cinema">
      <div class="flex items-start gap-4 mb-8">
        <div class="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <UIcon
            name="i-lucide-building-2"
            class="w-8 h-8 text-indigo-600"
          />
        </div>

        <div>
          <h1 class="text-3xl font-bold text-gray-900">
            {{ cinema.name }}
          </h1>
          <p class="mt-1 text-gray-600 flex items-center gap-1">
            <UIcon
              name="i-lucide-map-pin"
              class="w-4 h-4"
            />
            {{ cinema.address }}
          </p>
        </div>
      </div>

      <!-- Sessions -->
      <div>
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
          Сеансы
        </h2>

        <CinemaSessionsTable
          :sessions="sessions ?? []"
          :movies="movies ?? []"
          :loading="sessionsLoading"
        />
      </div>
    </template>
  </div>
</template>
