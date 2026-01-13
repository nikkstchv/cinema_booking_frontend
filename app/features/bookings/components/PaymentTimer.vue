<script setup lang="ts">
import { useCountdown } from '~/composables/useCountdown'
import { PAYMENT_WARNING_THRESHOLD_SECONDS } from '~/shared/lib/constants'
import { calculateRemainingSeconds } from '~/shared/lib/booking-utils'

const props = defineProps<{
  bookedAt: string
  timeoutSeconds: number
}>()

const emit = defineEmits<{
  expired: []
}>()

const initialSeconds = ref(0)

const { formattedTime, isExpired, remainingSeconds, reset, start } = useCountdown(
  initialSeconds.value,
  () => emit('expired')
)

onMounted(() => {
  const newRemaining = calculateRemainingSeconds(props.bookedAt, props.timeoutSeconds)
  initialSeconds.value = newRemaining
  reset(newRemaining)
  start()
})

watch(() => [props.bookedAt, props.timeoutSeconds], () => {
  if (import.meta.client) {
    const newRemaining = calculateRemainingSeconds(props.bookedAt, props.timeoutSeconds)
    reset(newRemaining)
  }
}, { immediate: false })

const isWarning = computed(() =>
  remainingSeconds.value > 0 && remainingSeconds.value <= PAYMENT_WARNING_THRESHOLD_SECONDS
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
