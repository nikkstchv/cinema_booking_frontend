<script setup lang="ts">
import SessionsTable from '~/features/movies/components/SessionsTable.vue'
import { useMovies, useMovieSessions } from '~/features/movies/composables/useMovies'
import { useCinemas } from '~/features/cinemas/composables/useCinemas'
import { formatDuration, getFullPosterUrl } from '~/shared/lib/formatters'

const route = useRoute()
const config = useRuntimeConfig()
const { handleError } = useErrorHandler()

const movieId = computed(() => Number(route.params.id))

// Fetch data
const { data: movies, isLoading: moviesLoading, error: moviesError } = useMovies() as { data: Ref<import('~/shared/schemas').Movie[] | undefined>, isLoading: Ref<boolean>, error: Ref<Error | null> }
const { data: sessions, isLoading: sessionsLoading, error: sessionsError } = useMovieSessions(movieId) as { data: Ref<import('~/shared/schemas').MovieSession[] | undefined>, isLoading: Ref<boolean>, error: Ref<Error | null> }
const { data: cinemas, isLoading: cinemasLoading } = useCinemas() as { data: Ref<import('~/shared/schemas').Cinema[] | undefined>, isLoading: Ref<boolean> }

// Find current movie
const movie = computed(() => {
  if (!movies.value) return undefined
  return movies.value.find(m => m.id === movieId.value)
})

const baseUrl = computed(() => {
  if (import.meta.client) {
    return window.location.origin
  }
  return config.public.apiBase.replace('/api', '') || 'http://localhost:3000'
})

const canonicalUrl = computed(() => `${baseUrl.value}/movies/${movieId.value}`)
const ogImageUrl = computed(() => movie.value ? getFullPosterUrl(movie.value.posterImage, config.public.apiBase) : '')

useHead({
  title: () => movie.value ? `${movie.value.title} - CinemaBook` : 'Загрузка...',
  meta: [
    { name: 'description', content: () => movie.value?.description || 'Информация о фильме и доступные сеансы' },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: () => movie.value?.title || 'CinemaBook' },
    { property: 'og:description', content: () => movie.value?.description || 'Информация о фильме и доступные сеансы' },
    { property: 'og:image', content: () => ogImageUrl.value },
    { property: 'og:url', content: () => canonicalUrl.value },
    { property: 'og:site_name', content: 'CinemaBook' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: () => movie.value?.title || 'CinemaBook' },
    { name: 'twitter:description', content: () => movie.value?.description || 'Информация о фильме и доступные сеансы' },
    { name: 'twitter:image', content: () => ogImageUrl.value }
  ],
  link: [
    { rel: 'canonical', href: () => canonicalUrl.value },
    ...(movie.value ? [{ rel: 'preload', as: 'image' as const, href: () => ogImageUrl.value }] : [])
  ]
})

// JSON-LD schema for movie
useHead({
  script: computed(() => movie.value
    ? [
        {
          type: 'application/ld+json',
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
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            'itemListElement': [
              {
                '@type': 'ListItem',
                'position': 1,
                'name': 'Фильмы',
                'item': `${baseUrl.value}/movies`
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
    : [])
})

// Handle errors
watch([moviesError, sessionsError], ([mErr, sErr]) => {
  if (mErr) handleError(mErr)
  if (sErr) handleError(sErr)
})

// 404 if movie not found
watch([movies, moviesLoading], ([m, loading]) => {
  if (!loading && m && !movie.value) {
    throw createError({
      statusCode: 404,
      message: 'Фильм не найден'
    })
  }
})

const posterUrl = computed(() =>
  movie.value ? getFullPosterUrl(movie.value.posterImage, config.public.apiBase) : ''
)

const isLoading = computed(() => moviesLoading.value || cinemasLoading.value)
</script>

<template>
  <div>
    <!-- Back button -->
    <NuxtLink
      to="/movies"
      class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
    >
      <UIcon
        name="i-lucide-arrow-left"
        class="w-4 h-4"
      />
      Назад к фильмам
    </NuxtLink>

    <!-- Loading -->
    <div
      v-if="isLoading"
      class="grid md:grid-cols-[300px_1fr] gap-8"
    >
      <USkeleton class="aspect-[2/3] w-full rounded-lg" />
      <div class="space-y-4">
        <USkeleton class="h-10 w-3/4" />
        <USkeleton class="h-6 w-1/4" />
        <USkeleton class="h-24 w-full" />
      </div>
    </div>

    <!-- Movie details -->
    <div
      v-else-if="movie"
      class="grid md:grid-cols-[300px_1fr] gap-8"
    >
      <!-- Poster -->
      <div class="space-y-4">
        <div class="aspect-[2/3] rounded-lg overflow-hidden bg-gray-100 shadow-lg">
          <img
            :src="posterUrl"
            :alt="movie.title"
            class="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            width="300"
            height="450"
          >
        </div>

        <div class="flex items-center justify-center gap-2 bg-gray-900/90 text-white px-4 py-2 rounded-lg shadow-lg">
          <UIcon
            name="i-lucide-star"
            class="w-5 h-5 text-yellow-400"
          />
          <span class="text-xl font-bold">{{ movie.rating.toFixed(1) }}</span>
          <span class="text-gray-300">/ 10</span>
        </div>
      </div>

      <!-- Info -->
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-4">
          {{ movie.title }}
        </h1>

        <div class="flex items-center gap-4 text-gray-600 mb-6">
          <span class="flex items-center gap-1">
            <UIcon
              name="i-lucide-calendar"
              class="w-4 h-4"
            />
            {{ movie.year }}
          </span>
          <span class="flex items-center gap-1">
            <UIcon
              name="i-lucide-clock"
              class="w-4 h-4"
            />
            {{ formatDuration(movie.lengthMinutes) }}
          </span>
        </div>

        <p class="text-gray-700 leading-relaxed mb-8">
          {{ movie.description }}
        </p>

        <!-- Sessions -->
        <div>
          <h2 class="text-xl font-semibold text-gray-900 mb-4">
            Сеансы
          </h2>

          <SessionsTable
            :sessions="sessions ?? []"
            :cinemas="cinemas ?? []"
            :loading="sessionsLoading"
          />
        </div>
      </div>
    </div>
  </div>
</template>
