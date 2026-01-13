import { useApiClient, ApiError } from '../client'
import { AuthResponseSchema, type LoginRequest, type RegisterRequest, type RegisterApiRequest, type AuthResponse } from '../../schemas'
import { logger } from '../../lib/logger'
import { API_ENDPOINTS } from '../../lib/api-endpoints'

export const authRepository = {
  async login(credentials: LoginRequest, signal?: AbortSignal): Promise<AuthResponse> {
    const client = useApiClient()
    const response = await client.post(API_ENDPOINTS.AUTH.LOGIN, credentials, { signal })

    const result = AuthResponseSchema.safeParse(response)
    if (!result.success) {
      const errorDetails = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      logger.error('Auth response validation failed:', result.error)
      throw new ApiError(`Неверный формат ответа сервера при авторизации: ${errorDetails}`, 500)
    }

    return result.data
  },

  async register(credentials: RegisterRequest, signal?: AbortSignal): Promise<AuthResponse> {
    const client = useApiClient()
    const apiRequest: RegisterApiRequest = {
      username: credentials.username,
      password: credentials.password
    }
    const response = await client.post(API_ENDPOINTS.AUTH.REGISTER, apiRequest, { signal })

    const result = AuthResponseSchema.safeParse(response)
    if (!result.success) {
      const errorDetails = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      logger.error('Auth response validation failed:', result.error)
      throw new ApiError(`Неверный формат ответа сервера при регистрации: ${errorDetails}`, 500)
    }

    return result.data
  }
}
