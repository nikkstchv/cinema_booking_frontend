<script setup lang="ts">
import { useCountdown } from '~/composables/useCountdown'

const props = defineProps<{
  bookedAt: string
  timeoutSeconds: number
}>()

const emit = defineEmits<{
  expired: []
}>()

// Calculate remaining time
const calculateRemaining = (): number => {
  const bookedTime = new Date(props.bookedAt).getTime()
  const expiryTime = bookedTime + props.timeoutSeconds * 1000
  const now = Date.now()
  const remaining = Math.floor((expiryTime - now) / 1000)
  return Math.max(0, remaining)
}

const initialSeconds = calculateRemaining()

const { formattedTime, isExpired, remainingSeconds } = useCountdown(
  initialSeconds,
  () => emit('expired')
)

// Warning state when less than 1 minute left
const isWarning = computed(() =>
  remainingSeconds.value > 0 && remainingSeconds.value <= 60
)
</script>

<template>
  <div
    class="flex items-center gap-2 text-sm font-medium"
    :class="{
      'text-red-600': isWarning || isExpired,
      'text-gray-600': !isWarning && !isExpired
    }"
  >
    <UIcon
      :name="isExpired ? 'i-lucide-x-circle' : 'i-lucide-clock'"
      class="w-4 h-4"
    />
    <span v-if="isExpired">
      Время истекло
    </span>
    <span v-else>
      Осталось: {{ formattedTime }}
    </span>
  </div>
</template>
