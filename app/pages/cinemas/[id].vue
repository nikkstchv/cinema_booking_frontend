<script setup lang="ts">
import CinemaSessionsTable from '~/features/cinemas/components/CinemaSessionsTable.vue'
import { useCinemas, useCinemaSessions } from '~/features/cinemas'
import { useMovies } from '~/features/movies'
import { useCinemaSEO } from '~/features/cinemas/composables/useCinemaSEO'
import { APP_ROUTES } from '~/shared/lib/app-routes'
import { createEntityMap } from '~/shared/lib/normalize'

const route = useRoute()
const { handleError } = useErrorHandler()

const cinemaId = computed(() => Number(route.params.id))

const { data: cinemas, isLoading: cinemasLoading, error: cinemasError } = useCinemas()
const { data: sessions, isLoading: sessionsLoading, error: sessionsError } = useCinemaSessions(cinemaId)
const { data: movies, isLoading: moviesLoading } = useMovies()

const cinemasMap = createEntityMap(cinemas)
const cinema = computed(() => cinemasMap.value.get(cinemaId.value))

useCinemaSEO(cinemaId, cinema)

// Handle errors
watch([cinemasError, sessionsError], ([cErr, sErr]) => {
  if (cErr) handleError(cErr)
  if (sErr) handleError(sErr)
})

// 404 if cinema not found
watch([cinemas, cinemasLoading], ([cinemasData, loading]) => {
  if (!loading && cinemasData && !cinema.value) {
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
      :to="APP_ROUTES.CINEMAS.INDEX"
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
