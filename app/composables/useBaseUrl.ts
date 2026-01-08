/**
 * Composable for getting base URL for canonical links and meta tags
 * @returns Computed ref with base URL (client-side uses window.location.origin, server-side uses config)
 */
export function useBaseUrl() {
  const config = useRuntimeConfig()

  return computed(() => {
    if (import.meta.client) {
      return window.location.origin
    }
    return config.public.apiBase.replace('/api', '') || 'http://localhost:3000'
  })
}
