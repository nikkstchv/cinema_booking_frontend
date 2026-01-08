<script setup lang="ts">
import TicketsList from '~/features/bookings/components/TicketsList.vue'
import { useMyBookings, useSettings, usePayBooking } from '~/features/bookings/composables/useBookings'
import { useMovies } from '~/features/movies/composables/useMovies'
import { useCinemas } from '~/features/cinemas/composables/useCinemas'
import { DEFAULT_PAYMENT_TIMEOUT_SECONDS } from '~/shared/lib/constants'
import { sessionsRepository } from '~/shared/api/repositories'
import type { MovieSession } from '~/shared/schemas'

definePageMeta({
  middleware: 'auth'
})

const config = useRuntimeConfig()

const baseUrl = computed(() => {
  if (process.client) {
    return window.location.origin
  }
  return config.public.apiBase.replace('/api', '') || 'http://localhost:3000'
})

useHead({
  title: 'Мои билеты - CinemaBook',
  meta: [
    { name: 'description', content: 'Просмотр и оплата забронированных билетов' },
    { name: 'robots', content: 'noindex, nofollow' }
  ],
  link: [
    { rel: 'canonical', href: () => `${baseUrl.value}/my-tickets` }
  ]
})

const { handleError } = useErrorHandler()

// Fetch data
const { data: bookings, isLoading: bookingsLoading, error: bookingsError, refetch: refetchBookings } = useMyBookings()
const { data: movies } = useMovies()
const { data: cinemas } = useCinemas()
const { data: settings } = useSettings()

// Payment mutation
const { mutate: pay, isPending: isPaying, variables: payingVariables } = usePayBooking()

// Payment timeout from settings
const paymentTimeoutSeconds = computed(() =>
  settings.value?.bookingPaymentTimeSeconds ?? DEFAULT_PAYMENT_TIMEOUT_SECONDS
)

// Fetch sessions for bookings
const sessions = ref<MovieSession[]>([])
const sessionsLoading = ref(false)

// Load sessions when bookings are available
watch(bookings, async (newBookings) => {
  if (!newBookings?.length) {
    sessions.value = []
    return
  }

  // Get unique session IDs
  const sessionIds = [...new Set(newBookings.map(b => b.movieSessionId))]

  sessionsLoading.value = true
  try {
    // Fetch all sessions in parallel
    const sessionDetails = await Promise.all(
      sessionIds.map(id => sessionsRepository.getById(id))
    )

    // Convert MovieSessionDetails to MovieSession (without bookedSeats)
    sessions.value = sessionDetails.map(s => ({
      id: s.id,
      movieId: s.movieId,
      cinemaId: s.cinemaId,
      startTime: s.startTime
    }))
  } catch (err) {
    handleError(err)
  } finally {
    sessionsLoading.value = false
  }
}, { immediate: true })

// Handle errors
watch(bookingsError, (err) => {
  if (err) handleError(err)
})

// Handle payment
const handlePay = (bookingId: string) => {
  pay(bookingId)
}

// Handle expired timer - refetch bookings
const handleExpired = () => {
  refetchBookings()
}

// Currently paying booking ID
const payingBookingId = computed(() =>
  isPaying.value ? payingVariables.value : null
)

const isLoading = computed(() => bookingsLoading.value || sessionsLoading.value)
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900 mb-8">
      Мои билеты
    </h1>

    <TicketsList
      :bookings="bookings ?? []"
      :movies="movies ?? []"
      :cinemas="cinemas ?? []"
      :sessions="sessions"
      :payment-timeout-seconds="paymentTimeoutSeconds"
      :loading="isLoading"
      :paying-booking-id="payingBookingId"
      @pay="handlePay"
      @expired="handleExpired"
    />
  </div>
</template>
