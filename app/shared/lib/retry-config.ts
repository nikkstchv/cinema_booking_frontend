import { ApiError } from '~/shared/api/client'
import { RETRY_DELAY_BASE_MS, RETRY_DELAY_MAX_MS, RETRY_EXPONENT_BASE, HTTP_STATUS_CODES } from './constants'

export const RETRY_CONFIG = {
  critical: {
    retries: 5,
    retryDelay: (attempt: number) => Math.min(RETRY_DELAY_BASE_MS * RETRY_EXPONENT_BASE ** attempt, RETRY_DELAY_MAX_MS)
  }
} as const

export function shouldRetry(error: unknown, attempt: number, maxRetries: number): boolean {
  if (attempt >= maxRetries) return false

  if (error instanceof ApiError) {
    if (error.status >= HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR) return true
    if (error.status === HTTP_STATUS_CODES.TOO_MANY_REQUESTS) return true
    if (error.status === HTTP_STATUS_CODES.REQUEST_TIMEOUT) return true
    return false
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true
  }

  return false
}
