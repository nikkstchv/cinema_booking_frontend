// Default payment timeout in seconds (fallback if API doesn't respond)
export const DEFAULT_PAYMENT_TIMEOUT_SECONDS = 180

// Seat status colors
export const SEAT_COLORS = {
  available: 'bg-gray-100 hover:bg-gray-200 border-gray-300',
  selected: 'bg-indigo-500 hover:bg-indigo-600 border-indigo-600 text-white',
  booked: 'bg-red-100 border-red-300 cursor-not-allowed'
} as const

// Navigation items
export const NAV_ITEMS = [
  { label: 'Фильмы', to: '/movies', icon: 'i-lucide-film' },
  { label: 'Кинотеатры', to: '/cinemas', icon: 'i-lucide-building-2' },
  { label: 'Мои билеты', to: '/my-tickets', icon: 'i-lucide-ticket' }
] as const

// Auth navigation items
export const AUTH_NAV_ITEMS = {
  login: { label: 'Вход', to: '/login', icon: 'i-lucide-log-in' },
  logout: { label: 'Выход', icon: 'i-lucide-log-out' }
} as const
