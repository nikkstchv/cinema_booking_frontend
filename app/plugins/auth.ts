import { useAuth } from '~/features/auth'

export default defineNuxtPlugin(() => {
  const { init } = useAuth()
  init()
})
