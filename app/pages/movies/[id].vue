<script setup lang="ts">
import SessionsTable from '~/features/movies/components/SessionsTable.vue'
import { useMovies, useMovieSessions } from '~/features/movies'
import { useCinemas } from '~/features/cinemas'
import { useMovieSEO } from '~/features/movies/composables/useMovieSEO'
import { formatDuration, getFullPosterUrl } from '~/shared/lib/formatters'
import { APP_ROUTES } from '~/shared/lib/app-routes'
import { createEntityMap } from '~/shared/lib/normalize'

const route = useRoute()
const config = useRuntimeConfig()
const { handleError } = useErrorHandler()

const movieId = computed(() => Number(route.params.id))

const { data: movies, isLoading: moviesLoading, error: moviesError } = useMovies()
const { data: sessions, isLoading: sessionsLoading, error: sessionsError } = useMovieSessions(movieId)
const { data: cinemas, isLoading: cinemasLoading } = useCinemas()

const moviesMap = createEntityMap(movies)
const movie = computed(() => moviesMap.value.get(movieId.value))

useMovieSEO(movieId, movie)

// Handle errors
watch([moviesError, sessionsError], ([mErr, sErr]) => {
  if (mErr) handleError(mErr)
  if (sErr) handleError(sErr)
})

// 404 if movie not found
watch([movies, moviesLoading], ([moviesData, loading]) => {
  if (!loading && moviesData && !movie.value) {
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
      :to="APP_ROUTES.MOVIES.INDEX"
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
