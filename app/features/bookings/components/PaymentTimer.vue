<script setup lang="ts">
import { useCountdown } from '~/composables/useCountdown'

const props = defineProps<{
  bookedAt: string
  timeoutSeconds: number
}>()

const emit = defineEmits<{
  expired: []
}>()

const calculateRemaining = (): number => {
  if (import.meta.server) {
    return 0
  }
  const bookedTime = new Date(props.bookedAt).getTime()
  const expiryTime = bookedTime + props.timeoutSeconds * 1000
  const now = Date.now()
  const remaining = Math.floor((expiryTime - now) / 1000)
  return Math.max(0, remaining)
}

const initialSeconds = ref(0)

const { formattedTime, isExpired, remainingSeconds, reset, start } = useCountdown(
  initialSeconds.value,
  () => emit('expired')
)

onMounted(() => {
  const newRemaining = calculateRemaining()
  initialSeconds.value = newRemaining
  reset(newRemaining)
  start()
})

watch(() => [props.bookedAt, props.timeoutSeconds], () => {
  if (import.meta.client) {
    const newRemaining = calculateRemaining()
    reset(newRemaining)
  }
}, { immediate: false })

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
