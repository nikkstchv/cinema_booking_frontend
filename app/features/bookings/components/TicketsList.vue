<script setup lang="ts">
import type { Booking, Movie, Cinema, MovieSession } from '~/shared/schemas'
import TicketCard from './TicketCard.vue'

const props = defineProps<{
  bookings: Booking[]
  movies: Movie[]
  cinemas: Cinema[]
  sessions: MovieSession[]
  paymentTimeoutSeconds: number
  loading?: boolean
  payingBookingId?: string | null
}>()

const emit = defineEmits<{
  pay: [bookingId: string]
  expired: []
}>()

type BookingCategory = 'unpaid' | 'future' | 'past'

const getBookingCategory = (booking: Booking): BookingCategory => {
  if (!booking.isPaid) {
    return 'unpaid'
  }

  const session = getSession(booking)
  if (!session) {
    return 'future'
  }

  const sessionTime = new Date(session.startTime).getTime()
  const now = Date.now()

  return sessionTime > now ? 'future' : 'past'
}

const groupedBookings = computed(() => {
  const groups: Record<BookingCategory, Booking[]> = {
    unpaid: [],
    future: [],
    past: []
  }

  props.bookings.forEach((booking) => {
    const category = getBookingCategory(booking)
    groups[category].push(booking)
  })

  Object.values(groups).forEach((group) => {
    group.sort((a, b) => {
      const sessionA = getSession(a)
      const sessionB = getSession(b)
      if (sessionA && sessionB) {
        return new Date(sessionB.startTime).getTime() - new Date(sessionA.startTime).getTime()
      }
      return new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime()
    })
  })

  return groups
})

const categoryLabels: Record<BookingCategory, string> = {
  unpaid: 'Неоплаченные',
  future: 'Будущие',
  past: 'Прошедшие'
}

const getMovie = (booking: Booking): Movie | undefined => {
  const session = props.sessions.find(s => s.id === booking.movieSessionId)
  return props.movies.find(m => m.id === session?.movieId)
}

const getCinema = (booking: Booking): Cinema | undefined => {
  const session = props.sessions.find(s => s.id === booking.movieSessionId)
  return props.cinemas.find(c => c.id === session?.cinemaId)
}

const getSession = (booking: Booking): MovieSession | undefined => {
  return props.sessions.find(s => s.id === booking.movieSessionId)
}
</script>

<template>
  <div class="space-y-4">
    <!-- Loading -->
    <template v-if="loading">
      <UCard
        v-for="i in 3"
        :key="i"
      >
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1 space-y-3">
            <USkeleton class="h-5 w-3/4" />
            <USkeleton class="h-4 w-1/2" />
            <USkeleton class="h-4 w-1/3" />
          </div>
          <div class="flex flex-col items-end gap-2">
            <USkeleton class="h-5 w-24" />
            <USkeleton class="h-8 w-20" />
          </div>
        </div>
      </UCard>
    </template>

    <!-- Bookings list -->
    <template v-else-if="bookings.length">
      <template v-for="category in (['unpaid', 'future', 'past'] as const)">
        <div
          v-if="groupedBookings[category as BookingCategory].length > 0"
          :key="category"
          class="space-y-4"
        >
          <h2 class="text-xl font-semibold text-gray-900 mt-8 first:mt-0">
            {{ categoryLabels[category as BookingCategory] }}
          </h2>
          <TicketCard
            v-for="booking in groupedBookings[category as BookingCategory]"
            :key="booking.id"
            :booking="booking"
            :movie="getMovie(booking)"
            :cinema="getCinema(booking)"
            :session="getSession(booking)"
            :payment-timeout-seconds="paymentTimeoutSeconds"
            :pay-loading="payingBookingId === booking.id"
            @pay="emit('pay', booking.id)"
            @expired="emit('expired')"
          />
        </div>
      </template>
    </template>

    <!-- Empty state -->
    <UCard
      v-else
      class="text-center py-12"
    >
      <UIcon
        name="i-lucide-ticket"
        class="w-12 h-12 mx-auto text-gray-400 mb-4"
      />
      <h3 class="text-lg font-medium text-gray-900 mb-2">
        У вас пока нет билетов
      </h3>
      <p class="text-gray-500 mb-6">
        Забронируйте места на понравившийся сеанс
      </p>
      <UButton to="/movies">
        Смотреть фильмы
      </UButton>
    </UCard>
  </div>
</template>
