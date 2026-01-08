import { describe, it, expect, beforeEach, vi } from 'vitest'
import { authRepository } from '~/shared/api/repositories'
import { useApiClient, ApiError } from '~/shared/api/client'
import type { LoginRequest, RegisterRequest } from '~/shared/schemas'

vi.mock('~/shared/api/client', () => ({
  useApiClient: vi.fn(),
  ApiError: class ApiError extends Error {
    constructor(message: string, public status: number) {
      super(message)
      this.name = 'ApiError'
    }
  }
}))

describe('authRepository', () => {
  let mockClient: {
    post: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockClient = {
      post: vi.fn()
    }
    vi.mocked(useApiClient).mockReturnValue(mockClient as ReturnType<typeof useApiClient>)
  })

  describe('login', () => {
    it('calls API client with correct credentials', async () => {
      const credentials: LoginRequest = {
        username: 'testuser',
        password: 'password123'
      }
      const mockResponse = { token: 'test-token' }
      mockClient.post.mockResolvedValue(mockResponse)

      const result = await authRepository.login(credentials)

      expect(mockClient.post).toHaveBeenCalledWith('/login', credentials, expect.anything())
      expect(result).toEqual(mockResponse)
    })

    it('throws ApiError on invalid response', async () => {
      const credentials: LoginRequest = {
        username: 'testuser',
        password: 'password123'
      }
      mockClient.post.mockResolvedValue({ invalid: 'data' })

      await expect(authRepository.login(credentials)).rejects.toThrow(ApiError)
    })
  })

  describe('register', () => {
    it('calls API client with correct credentials', async () => {
      const credentials: RegisterRequest = {
        username: 'testuser',
        password: 'Password123',
        passwordConfirmation: 'Password123'
      }
      const mockResponse = { token: 'test-token' }
      mockClient.post.mockResolvedValue(mockResponse)

      const result = await authRepository.register(credentials)

      expect(mockClient.post).toHaveBeenCalledWith(
        '/register',
        { username: credentials.username, password: credentials.password },
        expect.anything()
      )
      expect(result).toEqual(mockResponse)
    })

    it('throws ApiError on invalid response', async () => {
      const credentials: RegisterRequest = {
        username: 'testuser',
        password: 'Password123',
        passwordConfirmation: 'Password123'
      }
      mockClient.post.mockResolvedValue({ invalid: 'data' })

      await expect(authRepository.register(credentials)).rejects.toThrow(ApiError)
    })
  })
})
