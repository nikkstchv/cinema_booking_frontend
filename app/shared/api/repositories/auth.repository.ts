import { useApiClient, ApiError } from '../client'
import { AuthResponseSchema, type LoginRequest, type RegisterRequest, type RegisterApiRequest, type AuthResponse } from '../../schemas'
import { logger } from '../../lib/logger'

export const authRepository = {
  async login(credentials: LoginRequest, signal?: AbortSignal): Promise<AuthResponse> {
    const client = useApiClient()
    const response = await client.post<unknown>('/login', credentials, { signal })

    const result = AuthResponseSchema.safeParse(response)
    if (!result.success) {
      logger.error('Auth response validation failed:', result.error)
      throw new ApiError('Invalid auth response', 500)
    }

    return result.data
  },

  async register(credentials: RegisterRequest, signal?: AbortSignal): Promise<AuthResponse> {
    const client = useApiClient()
    const apiRequest: RegisterApiRequest = {
      username: credentials.username,
      password: credentials.password
    }
    const response = await client.post<unknown>('/register', apiRequest, { signal })

    const result = AuthResponseSchema.safeParse(response)
    if (!result.success) {
      logger.error('Auth response validation failed:', result.error)
      throw new ApiError('Invalid auth response', 500)
    }

    return result.data
  }
}
