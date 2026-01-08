import { createApiClient } from '~/shared/api/client'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const token = useCookie('auth_token')

  // Initialize API client with token getter
  const apiClient = createApiClient(
    config.public.apiBase,
    () => token.value ?? null
  )

  return {
    provide: {
      api: apiClient
    }
  }
})
