import { useAuth } from '~/features/auth/composables/useAuth'

export default defineNuxtPlugin(() => {
  const { init } = useAuth()
  init()
})
