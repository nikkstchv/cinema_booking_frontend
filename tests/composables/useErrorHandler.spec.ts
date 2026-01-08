import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useErrorHandler } from '~/composables/useErrorHandler'
import { ApiError } from '~/shared/api/client'

vi.mock('#app', () => ({
  useToast: vi.fn(() => ({
    add: vi.fn()
  })),
  useCookie: vi.fn(() => ({ value: null })),
  navigateTo: vi.fn()
}))

describe('useErrorHandler', () => {
  let toast: { add: ReturnType<typeof vi.fn> }
  let navigateTo: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    const { useToast } = await import('#app')
    const { navigateTo: nav } = await import('#app')
    toast = vi.mocked(useToast)()
    navigateTo = vi.mocked(nav)
  })

  it('handles ApiError with 401 status', () => {
    const { handleError } = useErrorHandler()
    const error = new ApiError('Unauthorized', 401)

    handleError(error)

    expect(navigateTo).toHaveBeenCalledWith('/login')
    expect(toast.add).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Ошибка авторизации',
        color: 'red'
      })
    )
  })

  it('handles ApiError with 404 status', () => {
    const { handleError } = useErrorHandler()
    const error = new ApiError('Not Found', 404)

    handleError(error)

    expect(toast.add).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Не найдено',
        color: 'red'
      })
    )
  })

  it('handles ApiError with 500 status', () => {
    const { handleError } = useErrorHandler()
    const error = new ApiError('Server Error', 500)

    handleError(error)

    expect(toast.add).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Ошибка сервера',
        color: 'red'
      })
    )
  })

  it('handles network errors', () => {
    const { handleError } = useErrorHandler()
    const error = new Error('Failed to fetch')

    handleError(error)

    expect(toast.add).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Ошибка сети',
        color: 'red'
      })
    )
  })

  it('ignores AbortError', () => {
    const { handleError } = useErrorHandler()
    const error = new Error('AbortError')
    error.name = 'AbortError'

    handleError(error)

    expect(toast.add).not.toHaveBeenCalled()
  })

  it('handles unknown errors', () => {
    const { handleError } = useErrorHandler()
    const error = 'Unknown error'

    handleError(error)

    expect(toast.add).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Неизвестная ошибка',
        color: 'red'
      })
    )
  })
})
