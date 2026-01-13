<script setup lang="ts">
import MovieGrid from '~/features/movies/components/MovieGrid.vue'
import { useMovies } from '~/features/movies'
import { APP_ROUTES } from '~/shared/lib/app-routes'

const baseUrl = useBaseUrl()

useHead({
  title: 'Фильмы - CinemaBook',
  meta: [
    { name: 'description', content: 'Список всех доступных фильмов. Бронируйте билеты онлайн в кинотеатры.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: 'Фильмы - CinemaBook' },
    { property: 'og:description', content: 'Список всех доступных фильмов. Бронируйте билеты онлайн в кинотеатры.' },
    { property: 'og:url', content: () => `${baseUrl.value}${APP_ROUTES.MOVIES.INDEX}` },
    { property: 'og:site_name', content: 'CinemaBook' }
  ],
  link: [
    { rel: 'canonical', href: () => `${baseUrl.value}${APP_ROUTES.MOVIES.INDEX}` }
  ]
})

const { data: movies, isLoading, error } = useMovies()
const { handleError } = useErrorHandler()

// Handle query errors
watch(error, (err) => {
  if (err) handleError(err)
})
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900 mb-8">
      Фильмы
    </h1>

    <MovieGrid
      :movies="movies ?? []"
      :loading="isLoading"
    />
  </div>
</template>
