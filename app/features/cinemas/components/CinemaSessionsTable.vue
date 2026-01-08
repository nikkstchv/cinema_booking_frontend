<script setup lang="ts">
import type { MovieSession, Movie } from '~/shared/schemas'
import { formatDate, formatTime } from '~/shared/lib/formatters'

const props = defineProps<{
  sessions: MovieSession[]
  movies: Movie[]
  loading?: boolean
}>()

// Group sessions by date
const groupedSessions = computed(() => {
  const groups: Record<string, MovieSession[]> = {}

  for (const session of props.sessions) {
    const date = formatDate(session.startTime)
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(session)
  }

  // Sort sessions within each date by time
  for (const date in groups) {
    const group = groups[date]
    if (group) {
      group.sort((a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      )
    }
  }

  return groups
})

const dates = computed(() => Object.keys(groupedSessions.value).sort())

// Get movie by ID
const getMovie = (movieId: number): Movie | undefined => {
  return props.movies.find(m => m.id === movieId)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Loading -->
    <template v-if="loading">
      <div
        v-for="i in 3"
        :key="i"
        class="space-y-3"
      >
        <USkeleton class="h-6 w-32" />
        <USkeleton class="h-16 w-full" />
        <USkeleton class="h-16 w-full" />
      </div>
    </template>

    <!-- Sessions grouped by date -->
    <template v-else-if="sessions.length">
      <div
        v-for="date in dates"
        :key="date"
      >
        <h3 class="text-lg font-semibold text-gray-900 mb-3">
          {{ date }}
        </h3>

        <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div class="divide-y divide-gray-200">
            <NuxtLink
              v-for="session in groupedSessions[date]"
              :key="session.id"
              :to="`/sessions/${session.id}`"
              class="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center gap-4">
                <div class="text-lg font-semibold text-indigo-600">
                  {{ formatTime(session.startTime) }}
                </div>
                <div>
                  <div class="font-medium text-gray-900">
                    {{ getMovie(session.movieId)?.title ?? 'Загрузка...' }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ getMovie(session.movieId)?.year }}
                  </div>
                </div>
              </div>

              <UButton
                variant="outline"
                size="sm"
              >
                Выбрать места
                <UIcon
                  name="i-lucide-chevron-right"
                  class="w-4 h-4 ml-1"
                />
              </UButton>
            </NuxtLink>
          </div>
        </div>
      </div>
    </template>

    <!-- Empty state -->
    <UCard
      v-else
      class="text-center py-8"
    >
      <UIcon
        name="i-lucide-calendar-x"
        class="w-10 h-10 mx-auto text-gray-400 mb-3"
      />
      <h3 class="text-lg font-medium text-gray-900 mb-1">
        Сеансов нет
      </h3>
      <p class="text-gray-500">
        В этом кинотеатре пока нет доступных сеансов
      </p>
    </UCard>
  </div>
</template>
