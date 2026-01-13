import { ApiError } from '~/shared/api/client'
import { useOnlineStatus } from './useOnlineStatus'
import { HTTP_STATUS_CODES } from '~/shared/lib/constants'
import { ERROR_MESSAGES } from '~/shared/lib/error-messages'
import type { AuthHandlers } from '~/shared/types/auth.types'

interface ErrorMessage {
  title: string
  description: string
  icon: string
  action?: string
}

const getNormalizedMessage = (message: string, fallback: string): string => {
  return message?.trim() || fallback
}

const CLIENT_ERROR_MAP: Record<number, Omit<ErrorMessage, 'description'> & { getDescription: (message: string) => string }> = {
  [HTTP_STATUS_CODES.BAD_REQUEST]: {
    title: ERROR_MESSAGES.VALIDATION.TITLE,
    icon: 'i-lucide-alert-circle',
    action: ERROR_MESSAGES.VALIDATION.ACTION,
    getDescription: (message: string) => getNormalizedMessage(message, ERROR_MESSAGES.VALIDATION.DESCRIPTION)
  },
  [HTTP_STATUS_CODES.UNAUTHORIZED]: {
    title: ERROR_MESSAGES.UNAUTHORIZED.TITLE,
    icon: 'i-lucide-lock',
    action: ERROR_MESSAGES.UNAUTHORIZED.ACTION,
    getDescription: (message: string) => getNormalizedMessage(message, ERROR_MESSAGES.UNAUTHORIZED.DESCRIPTION)
  },
  [HTTP_STATUS_CODES.FORBIDDEN]: {
    title: ERROR_MESSAGES.FORBIDDEN.TITLE,
    icon: 'i-lucide-shield-alert',
    action: ERROR_MESSAGES.FORBIDDEN.ACTION,
    getDescription: (message: string) => getNormalizedMessage(message, ERROR_MESSAGES.FORBIDDEN.DESCRIPTION)
  },
  [HTTP_STATUS_CODES.NOT_FOUND]: {
    title: ERROR_MESSAGES.NOT_FOUND.TITLE,
    icon: 'i-lucide-search-x',
    action: ERROR_MESSAGES.NOT_FOUND.ACTION,
    getDescription: (message: string) => getNormalizedMessage(message, ERROR_MESSAGES.NOT_FOUND.DESCRIPTION)
  },
  [HTTP_STATUS_CODES.CONFLICT]: {
    title: ERROR_MESSAGES.CONFLICT.TITLE,
    icon: 'i-lucide-alert-triangle',
    action: ERROR_MESSAGES.CONFLICT.ACTION,
    getDescription: (message: string) => getNormalizedMessage(message, ERROR_MESSAGES.CONFLICT.DESCRIPTION)
  },
  [HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY]: {
    title: ERROR_MESSAGES.UNPROCESSABLE_ENTITY.TITLE,
    icon: 'i-lucide-alert-circle',
    action: ERROR_MESSAGES.UNPROCESSABLE_ENTITY.ACTION,
    getDescription: (message: string) => getNormalizedMessage(message, ERROR_MESSAGES.UNPROCESSABLE_ENTITY.DESCRIPTION)
  }
}

const getClientErrorMessage = (status: number, message: string): ErrorMessage => {
  const errorConfig = CLIENT_ERROR_MAP[status]
  if (errorConfig) {
    return {
      title: errorConfig.title,
      description: errorConfig.getDescription(message),
      icon: errorConfig.icon,
      action: errorConfig.action
    }
  }
  return {
    title: ERROR_MESSAGES.UNKNOWN.TITLE,
    description: getNormalizedMessage(message, ERROR_MESSAGES.UNKNOWN.DESCRIPTION),
    icon: 'i-lucide-x-circle',
    action: ERROR_MESSAGES.UNKNOWN.ACTION
  }
}

const getServerErrorMessage = (message: string): ErrorMessage => {
  return {
    title: ERROR_MESSAGES.SERVER_ERROR.TITLE,
    description: getNormalizedMessage(message, ERROR_MESSAGES.SERVER_ERROR.DESCRIPTION),
    icon: 'i-lucide-server-off',
    action: ERROR_MESSAGES.SERVER_ERROR.ACTION
  }
}

const getErrorMessage = (status: number, message: string): ErrorMessage => {
  if (status === 0) {
    return {
      title: ERROR_MESSAGES.NETWORK_ERROR.TITLE,
      description: getNormalizedMessage(message, ERROR_MESSAGES.NETWORK_ERROR.DESCRIPTION),
      icon: 'i-lucide-wifi-off',
      action: ERROR_MESSAGES.NETWORK_ERROR.ACTION
    }
  }
  if (status >= HTTP_STATUS_CODES.BAD_REQUEST && status < HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR) {
    return getClientErrorMessage(status, message)
  }
  if (status >= HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR) {
    return getServerErrorMessage(message)
  }
  return {
    title: ERROR_MESSAGES.UNKNOWN.TITLE,
    description: getNormalizedMessage(message, ERROR_MESSAGES.UNKNOWN.DESCRIPTION),
    icon: 'i-lucide-x-circle',
    action: ERROR_MESSAGES.UNKNOWN.ACTION
  }
}

const TOAST_TIMEOUT_MS = 5000

/**
 * Error handler composable for centralized error handling
 *
 * @param authHandlers - Optional auth handlers for handling 401 errors
 * @returns Object with handleError method that:
 * - Shows appropriate toast notifications based on error type
 * - Handles API errors with status-specific messages
 * - Handles network errors
 * - Automatically logs out user on 401 errors if authHandlers provided
 */
export function useErrorHandler(authHandlers?: AuthHandlers) {
  const toast = useToast()
  const { isOnline } = useOnlineStatus()

  const handleError = (error: unknown) => {
    if (error instanceof ApiError) {
      const { title, description, icon, action } = getErrorMessage(error.status, error.message)

      if (error.status === HTTP_STATUS_CODES.UNAUTHORIZED && authHandlers) {
        toast.add({
          title,
          description,
          color: 'red',
          icon,
          timeout: TOAST_TIMEOUT_MS
        })

        if (authHandlers.isAuthenticated()) {
          authHandlers.logout()
        }
        return
      }

      toast.add({
        title,
        description: action ? `${description}. ${action}` : description,
        color: 'red',
        icon,
        timeout: TOAST_TIMEOUT_MS
      })
    } else if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return
      }

      const isNetworkError = error.message.includes('Failed to fetch') || error.message.includes('NetworkError')

      if (!isOnline.value || isNetworkError) {
        toast.add({
          title: ERROR_MESSAGES.NETWORK_ERROR.TITLE,
          description: ERROR_MESSAGES.NETWORK_ERROR.DESCRIPTION,
          color: 'red',
          icon: 'i-lucide-wifi-off',
          timeout: TOAST_TIMEOUT_MS
        })
        return
      }

      toast.add({
        title: ERROR_MESSAGES.NETWORK_ERROR_GENERIC.TITLE,
        description: error.message || ERROR_MESSAGES.NETWORK_ERROR_GENERIC.DESCRIPTION,
        color: 'red',
        icon: 'i-lucide-wifi-off',
        timeout: TOAST_TIMEOUT_MS
      })
    } else {
      toast.add({
        title: ERROR_MESSAGES.UNKNOWN_GENERIC.TITLE,
        description: ERROR_MESSAGES.UNKNOWN_GENERIC.DESCRIPTION,
        color: 'red',
        icon: 'i-lucide-x-circle',
        timeout: TOAST_TIMEOUT_MS
      })
    }
  }

  return { handleError }
}
