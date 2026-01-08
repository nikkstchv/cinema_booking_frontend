<script setup lang="ts">
import TicketsList from '~/features/bookings/components/TicketsList.vue'
import { useMyBookings, useSettings, usePayBooking } from '~/features/bookings/composables/useBookings'
import { DEFAULT_PAYMENT_TIMEOUT_SECONDS, TIME_CONSTANTS } from '~/shared/lib/constants'

definePageMeta({
  middleware: 'auth'
})

const baseUrl = useBaseUrl()

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

const { data: bookings, isLoading: bookingsLoading, error: bookingsError, refetch: refetchBookings } = useMyBookings()
const { data: settings } = useSettings()
const { mutate: pay, isPending: isPaying, variables: payingVariables } = usePayBooking()

const paymentTimeoutSeconds = computed(() =>
  settings.value?.bookingPaymentTimeSeconds ?? DEFAULT_PAYMENT_TIMEOUT_SECONDS
)

watch(bookingsError, (err) => {
  if (err) handleError(err)
})

const handlePay = (bookingId: string) => {
  if (isPaying.value || payingVariables.value === bookingId) {
    return
  }
  pay(bookingId)
}

const handleExpired = () => {
  refetchBookings()
}

const checkExpiredBookings = () => {
  if (!bookings.value || !settings.value) return

  const now = Date.now()
  const timeoutMs = paymentTimeoutSeconds.value * 1000

  const hasExpired = bookings.value.some((booking) => {
    if (booking.isPaid) return false
    const bookedTime = new Date(booking.bookedAt).getTime()
    return now - bookedTime > timeoutMs
  })

  if (hasExpired) {
    refetchBookings()
  }
}

const checkInterval = ref<ReturnType<typeof setInterval> | null>(null)

onMounted(() => {
  checkExpiredBookings()

  if (import.meta.client) {
    checkInterval.value = setInterval(() => {
      checkExpiredBookings()
    }, TIME_CONSTANTS.BOOKING_CHECK_INTERVAL_MS)

    window.addEventListener('focus', checkExpiredBookings)
  }
})

onUnmounted(() => {
  if (checkInterval.value) {
    clearInterval(checkInterval.value)
  }
  if (import.meta.client) {
    window.removeEventListener('focus', checkExpiredBookings)
  }
})

const payingBookingId = computed(() =>
  isPaying.value ? payingVariables.value : null
)

const announcement = ref('')

watch([bookings, isPaying], ([bookingsVal, paying]) => {
  if (paying) {
    announcement.value = 'Идет обработка оплаты...'
  } else if (bookingsVal && bookingsVal.length > 0) {
    const unpaidCount = bookingsVal.filter(b => !b.isPaid).length
    if (unpaidCount > 0) {
      announcement.value = `У вас ${unpaidCount} неоплаченных билетов`
    } else {
      announcement.value = 'Все билеты оплачены'
    }
  }
}, { immediate: true })
</script>

<template>
  <div>
    <div
      aria-live="polite"
      aria-atomic="true"
      class="sr-only"
    >
      {{ announcement }}
    </div>

    <h1 class="text-3xl font-bold text-gray-900 mb-8">
      Мои билеты
    </h1>

    <TicketsList
      :bookings="bookings ?? []"
      :payment-timeout-seconds="paymentTimeoutSeconds"
      :loading="bookingsLoading"
      :paying-booking-id="payingBookingId"
      @pay="handlePay"
      @expired="handleExpired"
    />
  </div>
</template>
