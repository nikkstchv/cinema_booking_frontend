import { authRepository } from '~/shared/api/repositories'
import type { LoginRequest } from '~/shared/schemas'

interface User {
  id: number
}

/**
 * Auth composable - manages authentication state
 * Uses useCookie for SSR-safe token storage and useState for user state
 */
export function useAuth() {
  // SSR-safe token in cookie
  const token = useCookie('auth_token', {
    maxAge: 60 * 60, // 1 hour
    secure: import.meta.env.PROD,
    sameSite: 'strict'
  })

  // SSR-safe user state (hydration-safe)
  const user = useState<User | null>('auth_user', () => null)

  // Computed auth state
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // Decode JWT to get user info
  const decodeToken = (): User | null => {
    if (!token.value) return null
    try {
      const parts = token.value.split('.')
      if (parts.length < 2 || !parts[1]) return null
      const payload = JSON.parse(atob(parts[1]))
      return { id: payload.sub }
    } catch {
      return null
    }
  }

  // Initialize auth state from token
  const init = () => {
    if (token.value && !user.value) {
      user.value = decodeToken()
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
  const register = async (credentials: LoginRequest) => {
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
