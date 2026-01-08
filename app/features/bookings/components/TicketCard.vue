<script setup lang="ts">
import type { Booking, Movie, Cinema, MovieSession } from '~/shared/schemas'
import { formatDateTime } from '~/shared/lib/formatters'
import PaymentTimer from './PaymentTimer.vue'
import BookingStatus from './BookingStatus.vue'

const props = defineProps<{
  booking: Booking
  movie?: Movie
  cinema?: Cinema
  session?: MovieSession
  paymentTimeoutSeconds: number
  payLoading?: boolean
}>()

const emit = defineEmits<{
  pay: []
  expired: []
}>()

const formatSeats = (booking: Booking): string => {
  return booking.seats
    .sort((a, b) => a.rowNumber - b.rowNumber || a.seatNumber - b.seatNumber)
    .map(s => `Р${s.rowNumber}М${s.seatNumber}`)
    .join(', ')
}

const isExpired = ref(false)

const handleExpired = () => {
  isExpired.value = true
  emit('expired')
}

// Show pay button only for unpaid and not expired
const showPayButton = computed(() =>
  !props.booking.isPaid && !isExpired.value
)
</script>

<template>
  <UCard
    class="transition-opacity"
    :class="{ 'opacity-60': isExpired && !booking.isPaid }"
  >
    <div class="flex flex-col sm:flex-row sm:items-start gap-4">
      <!-- Movie info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2 mb-2">
          <h3 class="font-semibold text-gray-900 truncate">
            {{ movie?.title ?? 'Загрузка...' }}
          </h3>
          <BookingStatus :is-paid="booking.isPaid" />
        </div>

        <div class="space-y-1 text-sm text-gray-600">
          <div class="flex items-center gap-1">
            <UIcon
              name="i-lucide-building-2"
              class="w-4 h-4 flex-shrink-0"
            />
            <span class="truncate">{{ cinema?.name ?? 'Загрузка...' }}</span>
          </div>

          <div class="flex items-center gap-1">
            <UIcon
              name="i-lucide-calendar"
              class="w-4 h-4 flex-shrink-0"
            />
            <span>{{ session ? formatDateTime(session.startTime) : 'Загрузка...' }}</span>
          </div>

          <div class="flex items-center gap-1">
            <UIcon
              name="i-lucide-armchair"
              class="w-4 h-4 flex-shrink-0"
            />
            <span>{{ formatSeats(booking) }}</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-col items-end gap-2 flex-shrink-0">
        <template v-if="!booking.isPaid">
          <PaymentTimer
            :booked-at="booking.bookedAt"
            :timeout-seconds="paymentTimeoutSeconds"
            @expired="handleExpired"
          />

          <UButton
            v-if="showPayButton"
            size="sm"
            :loading="payLoading"
            @click="emit('pay')"
          >
            <UIcon
              name="i-lucide-credit-card"
              class="w-4 h-4 mr-1"
            />
            Оплатить
          </UButton>

          <p
            v-if="isExpired"
            class="text-sm text-red-600"
          >
            Бронь отменена
          </p>
        </template>
      </div>
    </div>
  </UCard>
</template>
