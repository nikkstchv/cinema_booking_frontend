<script setup lang="ts">
import SeatSelector from '~/features/sessions/components/SeatSelector.vue'
import BookingConfirmation from '~/features/sessions/components/BookingConfirmation.vue'
import { useSessionDetails, useBookSession } from '~/features/sessions/composables/useSessions'
import { useMovies } from '~/features/movies/composables/useMovies'
import { useCinemas } from '~/features/cinemas/composables/useCinemas'
import { useAuth } from '~/features/auth/composables/useAuth'
import { formatDateTime } from '~/shared/lib/formatters'
import type { Seat } from '~/shared/schemas'

const route = useRoute()
const { handleError } = useErrorHandler()
const { isAuthenticated } = useAuth()

const sessionId = computed(() => Number(route.params.id))

// Fetch data
const { data: session, isLoading: sessionLoading, error: sessionError } = useSessionDetails(sessionId)
const { data: movies } = useMovies()
const { data: cinemas } = useCinemas()

// Booking mutation (only for authenticated users)
const { mutate: book, isPending: isBooking } = useBookSession(sessionId)

// Selected seats
const selectedSeats = ref<Seat[]>([])
const showConfirmation = ref(false)

// Get movie and cinema
const movie = computed(() => {
  if (!movies.value || !session.value) return undefined
  return movies.value.find(m => m.id === session.value?.movieId)
})
const cinema = computed(() => {
  if (!cinemas.value || !session.value) return undefined
  return cinemas.value.find(c => c.id === session.value?.cinemaId)
})

const baseUrl = useBaseUrl()

const canonicalUrl = computed(() => `${baseUrl.value}/sessions/${sessionId.value}`)

useHead({
  title: () => movie.value
    ? `Бронирование - ${movie.value.title} - CinemaBook`
    : 'Бронирование - CinemaBook',
  meta: [
    { name: 'description', content: () => movie.value ? `Бронирование билетов на фильм ${movie.value.title}` : 'Бронирование билетов в кинотеатр' },
    { name: 'robots', content: 'noindex, nofollow' }
  ],
  link: [
    { rel: 'canonical', href: () => canonicalUrl.value }
  ]
})

// Handle errors
watch(sessionError, (err) => {
  if (err) handleError(err)
})

// Handle seat selection
const handleSeatsUpdate = (seats: Seat[]) => {
  selectedSeats.value = seats
}

// Open confirmation modal or redirect to login
const openConfirmation = () => {
  if (!isAuthenticated.value) {
    navigateTo({
      path: '/login',
      query: {
        redirect: route.fullPath
      }
    })
    return
  }

  if (selectedSeats.value.length === 0) return
  showConfirmation.value = true
}

// Confirm booking
const confirmBooking = () => {
  book(selectedSeats.value, {
    onSuccess: () => {
      showConfirmation.value = false
      selectedSeats.value = []
      navigateTo('/my-tickets')
    }
  })
}

// Cancel booking confirmation
const cancelConfirmation = () => {
  showConfirmation.value = false
}
</script>

<template>
  <div>
    <!-- Back button -->
    <NuxtLink
      :to="movie ? `/movies/${movie.id}` : '/movies'"
      class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
    >
      <UIcon
        name="i-lucide-arrow-left"
        class="w-4 h-4"
      />
      Назад к фильму
    </NuxtLink>

    <!-- Loading -->
    <div
      v-if="sessionLoading"
      class="space-y-6"
    >
      <USkeleton class="h-8 w-1/2" />
      <USkeleton class="h-6 w-1/3" />
      <div class="flex flex-col items-center gap-2">
        <USkeleton
          v-for="i in 8"
          :key="i"
          class="h-10 w-80"
        />
      </div>
    </div>

    <!-- Session content -->
    <template v-else-if="session">
      <div class="max-w-3xl mx-auto">
        <!-- Session info -->
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-gray-900 mb-2">
            {{ movie?.title ?? 'Загрузка...' }}
          </h1>
          <div class="flex items-center justify-center gap-4 text-gray-600">
            <span class="flex items-center gap-1">
              <UIcon
                name="i-lucide-building-2"
                class="w-4 h-4"
              />
              {{ cinema?.name ?? 'Загрузка...' }}
            </span>
            <span class="flex items-center gap-1">
              <UIcon
                name="i-lucide-calendar"
                class="w-4 h-4"
              />
              {{ formatDateTime(session.startTime) }}
            </span>
          </div>
        </div>

        <!-- Seat selector -->
        <UCard class="mb-6">
          <SeatSelector
            :seats-info="session.seats"
            :booked-seats="session.bookedSeats"
            :disabled="isBooking || !isAuthenticated"
            @update:selected="handleSeatsUpdate"
          />
        </UCard>

        <!-- Book button -->
        <div class="text-center">
          <UButton
            size="lg"
            :disabled="!isAuthenticated || (isAuthenticated && selectedSeats.length === 0)"
            @click="openConfirmation"
          >
            <UIcon
              name="i-lucide-ticket"
              class="w-5 h-5 mr-2"
            />
            <template v-if="!isAuthenticated">
              Войти для бронирования
            </template>
            <template v-else>
              Забронировать
              <template v-if="selectedSeats.length > 0">
                ({{ selectedSeats.length }})
              </template>
            </template>
          </UButton>
        </div>
      </div>
    </template>

    <!-- Confirmation modal -->
    <UModal
      v-model="showConfirmation"
      aria-labelledby="booking-modal-title"
      aria-describedby="booking-modal-description"
      :ui="{ width: 'max-w-md' }"
    >
      <BookingConfirmation
        :seats="selectedSeats"
        :movie-title="movie?.title ?? ''"
        :cinema-name="cinema?.name ?? ''"
        :session-time="session ? formatDateTime(session.startTime) : ''"
        :loading="isBooking"
        @confirm="confirmBooking"
        @cancel="cancelConfirmation"
      />
    </UModal>
  </div>
</template>
