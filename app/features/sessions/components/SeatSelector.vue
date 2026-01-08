<script setup lang="ts">
import type { Seat, SeatsInfo } from '~/shared/schemas'
import SeatLegend from './SeatLegend.vue'

const props = defineProps<{
  seatsInfo: SeatsInfo
  bookedSeats: Seat[]
  disabled?: boolean
  maxSeats?: number
  isAuthenticated?: boolean
}>()

const emit = defineEmits<{
  'update:selected': [seats: Seat[]]
  'login-required': []
}>()

const selectedSeats = ref<Seat[]>([])

const seatRefs = ref<Map<string, HTMLButtonElement>>(new Map())

const isBooked = (row: number, seat: number): boolean => {
  return props.bookedSeats.some(
    s => s.rowNumber === row && s.seatNumber === seat
  )
}

const isSelected = (row: number, seat: number): boolean => {
  return selectedSeats.value.some(
    s => s.rowNumber === row && s.seatNumber === seat
  )
}

const toast = useToast()
const showLoginModal = ref(false)

const toggleSeat = (row: number, seat: number) => {
  if (props.disabled || isBooked(row, seat)) return

  const index = selectedSeats.value.findIndex(
    s => s.rowNumber === row && s.seatNumber === seat
  )

  if (index > -1) {
    selectedSeats.value.splice(index, 1)
    emit('update:selected', [...selectedSeats.value])
  } else {
    if (props.isAuthenticated === false) {
      showLoginModal.value = true
      return
    }

    if (props.maxSeats && selectedSeats.value.length >= props.maxSeats) {
      toast.add({
        title: 'Достигнут лимит',
        description: `Можно выбрать максимум ${props.maxSeats} мест`,
        color: 'orange',
        icon: 'i-lucide-alert-circle'
      })
      return
    }
    selectedSeats.value.push({ rowNumber: row, seatNumber: seat })
    emit('update:selected', [...selectedSeats.value])
  }
}

const handleLogin = () => {
  showLoginModal.value = false
  emit('login-required')
}

const handleCancel = () => {
  showLoginModal.value = false
}

// Get seat key for refs
const getSeatKey = (row: number, seat: number): string => `${row}-${seat}`

// Focus seat by coordinates
const focusSeat = (row: number, seat: number) => {
  // Clamp to valid range
  const clampedRow = Math.max(1, Math.min(row, props.seatsInfo.rows))
  const clampedSeat = Math.max(1, Math.min(seat, props.seatsInfo.seatsPerRow))

  const key = getSeatKey(clampedRow, clampedSeat)
  const el = seatRefs.value.get(key)
  el?.focus()
}

// Keyboard navigation
const handleKeydown = (e: KeyboardEvent, row: number, seat: number) => {
  const actions: Record<string, () => void> = {
    'ArrowUp': () => focusSeat(row - 1, seat),
    'ArrowDown': () => focusSeat(row + 1, seat),
    'ArrowLeft': () => focusSeat(row, seat - 1),
    'ArrowRight': () => focusSeat(row, seat + 1),
    'Enter': () => toggleSeat(row, seat),
    ' ': () => toggleSeat(row, seat)
  }

  const action = actions[e.key]
  if (action) {
    e.preventDefault()
    action()
  }
}

// Get seat CSS classes
const getSeatClasses = (row: number, seat: number): string => {
  const base = 'w-6 h-6 rounded border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'

  if (isBooked(row, seat)) {
    return `${base} bg-red-100 border-red-300 cursor-not-allowed`
  }

  if (isSelected(row, seat)) {
    return `${base} bg-indigo-500 border-indigo-600 text-white`
  }

  return `${base} bg-gray-100 border-gray-300 hover:bg-gray-200`
}

// Generate rows array
const rows = computed(() =>
  Array.from({ length: props.seatsInfo.rows }, (_, i) => i + 1)
)

// Generate seats array
const seats = computed(() =>
  Array.from({ length: props.seatsInfo.seatsPerRow }, (_, i) => i + 1)
)

// Clear selection when booked seats change (after booking)
watch(() => props.bookedSeats, () => {
  // Remove any selected seats that are now booked
  selectedSeats.value = selectedSeats.value.filter(
    s => !isBooked(s.rowNumber, s.seatNumber)
  )
  emit('update:selected', [...selectedSeats.value])
})
</script>

<template>
  <div class="space-y-6">
    <!-- Seats grid -->
    <div class="w-full overflow-x-auto">
      <!-- Screen indicator -->
      <div class="text-center mb-4">
        <div class="block w-full max-w-4xl mx-auto py-6 bg-gray-200 rounded-t-lg text-base text-gray-600 font-medium">
          Экран
        </div>
      </div>

      <div
        data-testid="seat-grid"
        role="grid"
        aria-label="Схема зала"
        aria-describedby="seat-instructions"
        class="flex flex-col gap-2 min-w-max mx-auto"
      >
        <p
          id="seat-instructions"
          class="sr-only"
        >
          Используйте стрелки для навигации, Enter или пробел для выбора места
        </p>

        <div class="flex items-center gap-2">
          <div class="w-8 flex-shrink-0" />
          <div class="flex gap-2">
            <div
              v-for="seat in seats"
              :key="seat"
              class="w-6 h-6 flex items-center justify-center text-xs text-gray-500 font-medium"
            >
              {{ seat }}
            </div>
          </div>
          <div class="w-8 flex-shrink-0" />
        </div>

        <div
          v-for="row in rows"
          :key="row"
          role="row"
          class="flex items-center gap-2"
        >
          <!-- Row number -->
          <div class="w-8 flex-shrink-0 text-right text-sm text-gray-500 font-medium">
            {{ row }}
          </div>

          <!-- Seats -->
          <div class="flex gap-2">
            <button
              v-for="seat in seats"
              :key="seat"
              :ref="(el) => { if (el) seatRefs.set(getSeatKey(row, seat), el as HTMLButtonElement) }"
              role="gridcell"
              :aria-label="`Ряд ${row}, место ${seat}`"
              :aria-pressed="isSelected(row, seat)"
              :aria-disabled="isBooked(row, seat) || disabled"
              :disabled="isBooked(row, seat) || disabled"
              :class="getSeatClasses(row, seat)"
              @click="toggleSeat(row, seat)"
              @keydown="handleKeydown($event, row, seat)"
            >
              <span class="sr-only">
                {{ isBooked(row, seat) ? 'Занято' : isSelected(row, seat) ? 'Выбрано' : 'Свободно' }}
              </span>
            </button>
          </div>

          <!-- Row number (right side) -->
          <div class="w-8 flex-shrink-0 text-left text-sm text-gray-500 font-medium">
            {{ row }}
          </div>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <SeatLegend />

    <!-- Selected count -->
    <div
      v-if="selectedSeats.length > 0"
      class="text-center text-sm text-gray-600"
      aria-live="polite"
    >
      Выбрано мест: <strong>{{ selectedSeats.length }}</strong>
    </div>

    <!-- Login required modal -->
    <UModal
      v-model="showLoginModal"
      aria-labelledby="login-modal-title"
      aria-describedby="login-modal-description"
      :ui="{ width: 'max-w-md' }"
    >
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon
              name="i-lucide-lock"
              class="w-6 h-6 text-indigo-600"
            />
            <h2
              id="login-modal-title"
              class="text-xl font-bold text-gray-900"
            >
              Требуется авторизация
            </h2>
          </div>
        </template>

        <div
          id="login-modal-description"
          class="space-y-4"
        >
          <p class="text-gray-600">
            Для бронирования билетов необходимо войти в систему.
          </p>
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              color="gray"
              variant="ghost"
              @click="handleCancel"
            >
              Отмена
            </UButton>
            <UButton
              color="primary"
              @click="handleLogin"
            >
              Войти
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>
