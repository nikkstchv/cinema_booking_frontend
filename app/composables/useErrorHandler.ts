import { ApiError } from '~/shared/api/client'
import { useAuth } from '~/features/auth/composables/useAuth'

interface ErrorMessage {
  title: string
  description: string
  icon: string
  action?: string
}

/**
 * Gets error message configuration for client errors (4xx)
 */
const getClientErrorMessage = (status: number, message: string): ErrorMessage => {
  switch (status) {
    case 400:
      return {
        title: 'Ошибка валидации',
        description: message || 'Проверьте правильность введенных данных',
        icon: 'i-lucide-alert-circle',
        action: 'Проверьте форму и попробуйте снова'
      }
    case 401:
      return {
        title: 'Ошибка авторизации',
        description: message || 'Неверное имя пользователя или пароль',
        icon: 'i-lucide-lock',
        action: 'Проверьте данные и попробуйте войти снова'
      }
    case 403:
      return {
        title: 'Доступ запрещен',
        description: message || 'У вас нет прав для выполнения этого действия',
        icon: 'i-lucide-shield-alert',
        action: 'Обратитесь к администратору'
      }
    case 404:
      return {
        title: 'Не найдено',
        description: message || 'Запрашиваемый ресурс не найден',
        icon: 'i-lucide-search-x',
        action: 'Вернитесь на главную страницу'
      }
    case 409:
      if (message.includes('уже существует') || message.includes('уже забронированы') || message.includes('уже оплачено')) {
        return {
          title: 'Конфликт',
          description: message,
          icon: 'i-lucide-alert-triangle',
          action: 'Обновите страницу и попробуйте снова'
        }
      }
      return {
        title: 'Конфликт',
        description: message || 'Произошел конфликт при выполнении операции',
        icon: 'i-lucide-alert-triangle',
        action: 'Обновите страницу и попробуйте снова'
      }
    default:
      return {
        title: 'Ошибка',
        description: message || 'Что-то пошло не так',
        icon: 'i-lucide-x-circle',
        action: 'Обновите страницу'
      }
  }
}

/**
 * Gets error message configuration for server errors (5xx)
 */
const getServerErrorMessage = (message: string): ErrorMessage => {
  return {
    title: 'Ошибка сервера',
    description: message || 'Внутренняя ошибка сервера. Попробуйте позже',
    icon: 'i-lucide-server-off',
    action: 'Попробуйте через несколько минут'
  }
}

/**
 * Gets error message configuration based on HTTP status code
 */
const getErrorMessage = (status: number, message: string): ErrorMessage => {
  if (status >= 400 && status < 500) {
    return getClientErrorMessage(status, message)
  }
  if (status >= 500) {
    return getServerErrorMessage(message)
  }
  return {
    title: 'Ошибка',
    description: message || 'Что-то пошло не так',
    icon: 'i-lucide-x-circle',
    action: 'Обновите страницу'
  }
}

/**
 * Error handler composable for centralized error handling
 *
 * @returns Object with handleError method that:
 * - Shows appropriate toast notifications based on error type
 * - Handles API errors with status-specific messages
 * - Handles network errors
 * - Automatically logs out user on 401 errors
 */
export function useErrorHandler() {
  const toast = useToast()

  /**
   * Handles errors and shows appropriate user notifications
   * @param error - Error object (ApiError, Error, or unknown)
   */
  const handleError = (error: unknown) => {
    if (error instanceof ApiError) {
      const { title, description, icon, action } = getErrorMessage(error.status, error.message)

      if (error.status === 401) {
        const { logout } = useAuth()
        logout()
        return
      }

      toast.add({
        title,
        description: action ? `${description}. ${action}` : description,
        color: 'red',
        icon,
        timeout: 5000
      })
    } else if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return
      }

      const isNetworkError = error.message.includes('Failed to fetch') || error.message.includes('NetworkError')
      toast.add({
        title: 'Ошибка сети',
        description: isNetworkError
          ? 'Не удалось подключиться к серверу. Проверьте подключение к интернету и попробуйте снова'
          : (error.message || 'Проверьте подключение к интернету'),
        color: 'red',
        icon: 'i-lucide-wifi-off',
        timeout: 5000
      })
    } else {
      toast.add({
        title: 'Неизвестная ошибка',
        description: 'Что-то пошло не так. Обновите страницу',
        color: 'red',
        icon: 'i-lucide-x-circle',
        timeout: 5000
      })
    }
  }

  return { handleError }
}
