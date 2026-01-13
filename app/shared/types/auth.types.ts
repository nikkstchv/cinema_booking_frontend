export interface AuthHandlers {
  isAuthenticated: () => boolean
  logout: () => void
}
