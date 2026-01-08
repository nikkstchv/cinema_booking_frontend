import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuth } from '~/features/auth/composables/useAuth'
import { authRepository } from '~/shared/api/repositories'

vi.mock('~/shared/api/repositories', () => ({
  authRepository: {
    login: vi.fn(),
    register: vi.fn()
  }
}))

vi.mock('#app', () => ({
  useCookie: vi.fn((_key: string) => {
    const value = { value: null as string | null }
    return value
  }),
  useState: vi.fn((key: string, init: () => unknown) => {
    return { value: init() }
  }),
  navigateTo: vi.fn(),
  computed: vi.fn((fn: () => unknown) => ({ value: fn() }))
}))

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('decodes JWT token correctly', () => {
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyM30.signature'
    const { useCookie } = await import('#app')
    vi.mocked(useCookie).mockReturnValue({ value: mockToken } as ReturnType<typeof useCookie>)

    const auth = useAuth()
    auth.init()

    expect(auth.user.value).toEqual({ id: 123 })
  })

  it('returns null for invalid token', async () => {
    const { useCookie } = await import('#app')
    vi.mocked(useCookie).mockReturnValue({ value: 'invalid-token' } as ReturnType<typeof useCookie>)

    const auth = useAuth()
    auth.init()

    expect(auth.user.value).toBeNull()
  })

  it('calls login repository on login', async () => {
    const mockResponse = { token: 'test-token' }
    vi.mocked(authRepository.login).mockResolvedValue(mockResponse)

    const { useCookie } = await import('#app')
    vi.mocked(useCookie).mockReturnValue({ value: null } as ReturnType<typeof useCookie>)

    const auth = useAuth()
    await auth.login({ username: 'testuser', password: 'password123' })

    expect(authRepository.login).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password123'
    })
  })

  it('calls register repository on register', async () => {
    const mockResponse = { token: 'test-token' }
    vi.mocked(authRepository.register).mockResolvedValue(mockResponse)

    const { useCookie } = await import('#app')
    vi.mocked(useCookie).mockReturnValue({ value: null } as ReturnType<typeof useCookie>)

    const auth = useAuth()
    await auth.register({ username: 'newuser', password: 'Password1' })

    expect(authRepository.register).toHaveBeenCalledWith({
      username: 'newuser',
      password: 'Password1'
    })
  })

  it('clears token on logout', async () => {
    const { useCookie, navigateTo } = await import('#app')
    const tokenCookie = { value: 'test-token' }
    vi.mocked(useCookie).mockReturnValue(tokenCookie as ReturnType<typeof useCookie>)

    const auth = useAuth()
    auth.logout()

    expect(tokenCookie.value).toBeNull()
    expect(navigateTo).toHaveBeenCalledWith('/movies')
  })

  it('computes isAuthenticated correctly', async () => {
    const { useCookie } = await import('#app')
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyM30.signature'
    vi.mocked(useCookie).mockReturnValue({ value: mockToken } as ReturnType<typeof useCookie>)

    const auth = useAuth()
    auth.init()

    expect(auth.isAuthenticated.value).toBe(true)
  })
})
