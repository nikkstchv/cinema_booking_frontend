import { authRepository } from '~/shared/api/repositories'
import { decodeJWT, isTokenExpired } from '~/shared/lib/jwt'
import type { LoginRequest, RegisterRequest } from '~/shared/schemas'

interface User {
  id: number
}

/**
 * Auth composable - manages authentication state
 * Uses useCookie for SSR-safe token storage and useState for user state
 *
 * @returns Object with auth state and methods:
 * - token: Computed ref with JWT token
 * - user: Computed ref with user object (id)
 * - isAuthenticated: Computed ref indicating if user is authenticated
 * - init: Initialize auth state from token (should be called in plugin)
 * - login: Login with credentials
 * - register: Register new user
 * - logout: Logout current user
 */
export function useAuth() {
  const token = useCookie('auth_token', {
    maxAge: 60 * 60,
    secure: import.meta.env.PROD,
    sameSite: 'strict'
  })

  const user = useState<User | null>('auth_user', () => null)

  const isAuthenticated = computed(() => {
    if (!token.value) return false
    if (isTokenExpired(token.value)) {
      token.value = null
      user.value = null
      return false
    }
    return !!user.value
  })

  const decodeToken = (): User | null => {
    if (!token.value) return null

    const decoded = decodeJWT(token.value)
    if (!decoded) {
      token.value = null
      return null
    }

    return { id: decoded.id }
  }

  const init = () => {
    if (token.value) {
      if (isTokenExpired(token.value)) {
        token.value = null
        user.value = null
        return
      }
      if (!user.value) {
        user.value = decodeToken()
      }
    }
  }

  // Login
  const login = async (credentials: LoginRequest) => {
    const response = await authRepository.login(credentials)
    token.value = response.token
    user.value = decodeToken()
    return response
  }

  // Register
  const register = async (credentials: RegisterRequest) => {
    const response = await authRepository.register(credentials)
    token.value = response.token
    user.value = decodeToken()
    return response
  }

  // Logout
  const logout = () => {
    token.value = null
    user.value = null
    navigateTo('/movies')
  }

  return {
    token: computed(() => token.value),
    user: computed(() => user.value),
    isAuthenticated,
    init,
    login,
    register,
    logout
  }
}
