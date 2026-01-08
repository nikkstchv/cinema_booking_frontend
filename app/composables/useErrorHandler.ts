import { ApiError } from '~/shared/api/client'

const getErrorMessage = (status: number, message: string): { title: string; description: string; icon: string } => {
  switch (status) {
    case 400:
      return {
        title: 'Ошибка валидации',
        description: message || 'Проверьте правильность введенных данных',
        icon: 'i-lucide-alert-circle'
      }
    case 401:
      return {
        title: 'Ошибка авторизации',
        description: message || 'Неверное имя пользователя или пароль',
        icon: 'i-lucide-lock'
      }
    case 403:
      return {
        title: 'Доступ запрещен',
        description: message || 'У вас нет прав для выполнения этого действия',
        icon: 'i-lucide-shield-alert'
      }
    case 404:
      return {
        title: 'Не найдено',
        description: message || 'Запрашиваемый ресурс не найден',
        icon: 'i-lucide-search-x'
      }
    case 409:
      if (message.includes('уже существует') || message.includes('уже забронированы') || message.includes('уже оплачено')) {
        return {
          title: 'Конфликт',
          description: message,
          icon: 'i-lucide-alert-triangle'
        }
      }
      return {
        title: 'Конфликт',
        description: message || 'Произошел конфликт при выполнении операции',
        icon: 'i-lucide-alert-triangle'
      }
    case 500:
      return {
        title: 'Ошибка сервера',
        description: message || 'Внутренняя ошибка сервера. Попробуйте позже',
        icon: 'i-lucide-server-off'
      }
    default:
      return {
        title: 'Ошибка',
        description: message || 'Что-то пошло не так',
        icon: 'i-lucide-x-circle'
      }
  }
}

export function useErrorHandler() {
  const toast = useToast()

  const handleError = (error: unknown) => {
    if (error instanceof ApiError) {
      const { title, description, icon } = getErrorMessage(error.status, error.message)

      if (error.status === 401) {
        const token = useCookie('auth_token')
        token.value = null
        navigateTo('/login')
      }

      toast.add({
        title,
        description,
        color: 'red',
        icon
      })
    } else if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return
      }

      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        toast.add({
          title: 'Ошибка сети',
          description: 'Не удалось подключиться к серверу. Проверьте подключение к интернету и попробуйте снова',
          color: 'red',
          icon: 'i-lucide-wifi-off'
        })
      } else {
        toast.add({
          title: 'Ошибка сети',
          description: error.message || 'Проверьте подключение к интернету',
          color: 'red',
          icon: 'i-lucide-wifi-off'
        })
      }
    } else {
      toast.add({
        title: 'Неизвестная ошибка',
        description: 'Что-то пошло не так',
        color: 'red',
        icon: 'i-lucide-x-circle'
      })
    }
  }

  return { handleError }
}
