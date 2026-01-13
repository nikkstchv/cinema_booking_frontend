<script setup lang="ts">
import type { Booking } from '~/shared/schemas'
import TicketCard from './TicketCard.vue'
import { useBookingData } from '../composables/useBookingData'
import { useBookingCategories, BOOKING_CATEGORIES, CATEGORY_LABELS } from '../composables/useBookingCategories'
import { APP_ROUTES } from '~/shared/lib/app-routes'

const props = defineProps<{
  bookings: Booking[]
  paymentTimeoutSeconds: number
  loading?: boolean
  payingBookingId?: string | null
}>()

const emit = defineEmits<{
  pay: [bookingId: string]
  expired: []
}>()

const { getMovie, getCinema, getSession } = useBookingData(computed(() => props.bookings))
const { groupedBookings } = useBookingCategories(computed(() => props.bookings), getSession)
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
      <template v-for="category in BOOKING_CATEGORIES">
        <div
          v-if="groupedBookings[category].length > 0"
          :key="category"
          class="space-y-4"
        >
          <h2 class="text-xl font-semibold text-gray-900 mt-8 first:mt-0">
            {{ CATEGORY_LABELS[category] }}
          </h2>
          <TicketCard
            v-for="booking in groupedBookings[category]"
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
      <UButton :to="APP_ROUTES.MOVIES.INDEX">
        Смотреть фильмы
      </UButton>
    </UCard>
  </div>
</template>
