<script setup lang="ts">
import type { MovieSession, Cinema } from '~/shared/schemas'
import { formatTime } from '~/shared/lib/formatters'
import { useSessionsGrouping } from '~/shared/composables/useSessionsGrouping'
import { APP_ROUTES } from '~/shared/lib/app-routes'

const props = defineProps<{
  sessions: MovieSession[]
  cinemas: Cinema[]
  loading?: boolean
}>()

const { groupedSessions, dates } = useSessionsGrouping(computed(() => props.sessions))

const cinemasMap = computed(() => {
  const map = new Map<number, Cinema>()
  props.cinemas.forEach((cinema) => {
    map.set(cinema.id, cinema)
  })
  return map
})

const getCinemaName = (cinemaId: number): string => {
  const cinema = cinemasMap.value.get(cinemaId)
  return cinema?.name ?? 'Неизвестный кинотеатр'
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
        <USkeleton class="h-12 w-full" />
        <USkeleton class="h-12 w-full" />
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
              :to="APP_ROUTES.SESSIONS.DETAIL(session.id)"
              class="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center gap-4">
                <div class="text-lg font-semibold text-indigo-600">
                  {{ formatTime(session.startTime) }}
                </div>
                <div class="text-gray-600">
                  {{ getCinemaName(session.cinemaId) }}
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
        На этот фильм пока нет доступных сеансов
      </p>
    </UCard>
  </div>
</template>
