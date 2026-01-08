import { ref, computed, onUnmounted } from 'vue'
import { TIME_CONSTANTS } from '~/shared/lib/constants'

export function useCountdown(initialSeconds: number, onExpire?: () => void) {
  const remainingSeconds = ref(initialSeconds)
  const isRunning = ref(false)
  let intervalId: ReturnType<typeof setInterval> | null = null

  const isExpired = computed(() => remainingSeconds.value <= 0)

  const formattedTime = computed(() => {
    if (remainingSeconds.value <= 0) return '0:00'
    const mins = Math.floor(remainingSeconds.value / 60)
    const secs = remainingSeconds.value % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  })

  const start = () => {
    if (isRunning.value || isExpired.value) return

    isRunning.value = true
    intervalId = setInterval(() => {
      remainingSeconds.value--

      if (remainingSeconds.value <= 0) {
        stop()
        onExpire?.()
      }
    }, TIME_CONSTANTS.COUNTDOWN_INTERVAL_MS)
  }

  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    isRunning.value = false
  }

  const reset = (seconds?: number) => {
    stop()
    remainingSeconds.value = seconds ?? initialSeconds
  }

  onUnmounted(() => {
    stop()
  })

  return {
    remainingSeconds: computed(() => remainingSeconds.value),
    formattedTime,
    isExpired,
    start,
    stop,
    reset
  }
}
