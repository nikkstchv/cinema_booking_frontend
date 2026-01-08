<script setup lang="ts">
import type { Seat } from '~/shared/schemas'
import { useFocusTrap } from '~/shared/composables/useFocusTrap'

const props = defineProps<{
  seats: Seat[]
  movieTitle: string
  cinemaName: string
  sessionTime: string
  loading?: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const containerRef = ref<HTMLElement | null>(null)

useFocusTrap(containerRef, () => {
  emit('cancel')
})

const formatSeats = (seats: Seat[]): string => {
  return seats
    .sort((a, b) => a.rowNumber - b.rowNumber || a.seatNumber - b.seatNumber)
    .map(s => `Ряд ${s.rowNumber}, место ${s.seatNumber}`)
    .join('\n')
}

const announcement = computed(() => {
  if (props.loading) {
    return 'Обработка бронирования...'
  }
  return `Подтверждение бронирования: ${props.movieTitle}, ${props.cinemaName}, ${props.seats.length} мест`
})
</script>

<template>
  <UCard ref="containerRef">
    <div
      aria-live="polite"
      aria-atomic="true"
      class="sr-only"
    >
      {{ announcement }}
    </div>
    <template #header>
      <h3
        id="booking-modal-title"
        class="text-lg font-semibold text-gray-900"
      >
        Подтверждение бронирования
      </h3>
      <p
        id="booking-modal-description"
        class="sr-only"
      >
        Подтвердите детали бронирования перед завершением
      </p>
    </template>

    <div class="space-y-4">
      <div>
        <div class="text-sm text-gray-500">
          Фильм
        </div>
        <div class="font-medium text-gray-900">
          {{ movieTitle }}
        </div>
      </div>

      <div>
        <div class="text-sm text-gray-500">
          Кинотеатр
        </div>
        <div class="font-medium text-gray-900">
          {{ cinemaName }}
        </div>
      </div>

      <div>
        <div class="text-sm text-gray-500">
          Время сеанса
        </div>
        <div class="font-medium text-gray-900">
          {{ sessionTime }}
        </div>
      </div>

      <div>
        <div class="text-sm text-gray-500 mb-1">
          Выбранные места ({{ seats.length }})
        </div>
        <div class="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-line">
          {{ formatSeats(seats) }}
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex flex-col gap-3">
        <UButton
          :loading="loading"
          block
          @click="emit('confirm')"
        >
          Забронировать
        </UButton>
        <UButton
          variant="outline"
          block
          :disabled="loading"
          @click="emit('cancel')"
        >
          Отмена
        </UButton>
      </div>
    </template>
  </UCard>
</template>
