import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useOnlineStatus() {
  const isOnline = ref(import.meta.client ? navigator.onLine : true)

  const updateOnlineStatus = () => {
    if (import.meta.client) {
      isOnline.value = navigator.onLine
    }
  }

  onMounted(() => {
    if (import.meta.client) {
      window.addEventListener('online', updateOnlineStatus)
      window.addEventListener('offline', updateOnlineStatus)
    }
  })

  onUnmounted(() => {
    if (import.meta.client) {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  })

  return {
    isOnline: computed(() => isOnline.value)
  }
}
