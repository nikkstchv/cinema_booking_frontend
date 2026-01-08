import { useApiClient, ApiError } from '../client'
import { AuthResponseSchema, type LoginRequest, type AuthResponse } from '../../schemas'

export const authRepository = {
  async login(credentials: LoginRequest, signal?: AbortSignal): Promise<AuthResponse> {
    const client = useApiClient()
    const response = await client.post<unknown>('/login', credentials, { signal })

    const result = AuthResponseSchema.safeParse(response)
    if (!result.success) {
      console.error('Auth response validation failed:', result.error)
      throw new ApiError('Invalid auth response', 500)
    }

    return result.data
  },

  async register(credentials: LoginRequest, signal?: AbortSignal): Promise<AuthResponse> {
    const client = useApiClient()
    const response = await client.post<unknown>('/register', credentials, { signal })

    const result = AuthResponseSchema.safeParse(response)
    if (!result.success) {
      console.error('Auth response validation failed:', result.error)
      throw new ApiError('Invalid auth response', 500)
    }

    return result.data
  }
}
