import { ApiError } from '~/shared/api/client'

export const RETRY_CONFIG = {
  default: {
    retries: 3,
    retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 10000)
  },
  critical: {
    retries: 5,
    retryDelay: (attempt: number) => Math.min(500 * 2 ** attempt, 5000)
  },
  nonCritical: {
    retries: 1,
    retryDelay: () => 1000
  }
} as const

export function shouldRetry(error: unknown, attempt: number, maxRetries: number): boolean {
  if (attempt >= maxRetries) return false

  if (error instanceof ApiError) {
    if (error.status >= 500) return true
    if (error.status === 429) return true
    if (error.status === 408) return true
    return false
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true
  }

  return false
}
