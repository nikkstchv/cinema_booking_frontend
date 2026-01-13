import { APP_ROUTES } from './app-routes'

export const DEFAULT_PAYMENT_TIMEOUT_SECONDS = 180

export const PAYMENT_WARNING_THRESHOLD_SECONDS = 60

export const AUTH_TOKEN_MAX_AGE_SECONDS = 60 * 60

export const TIME_CONSTANTS = {
  COUNTDOWN_INTERVAL_MS: 1000,
  BOOKING_CHECK_INTERVAL_MS: 10000,
  DEBOUNCE_DELAY_MS: 50
} as const

export const RETRY_DELAY_BASE_MS = 500
export const RETRY_DELAY_MAX_MS = 5000
export const RETRY_EXPONENT_BASE = 2

export const HTTP_STATUS_CODES = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  TOO_MANY_REQUESTS: 429,
  REQUEST_TIMEOUT: 408
} as const

export const SEAT_COLORS = {
  available: 'bg-gray-100 hover:bg-gray-200 border-gray-300',
  selected: 'bg-indigo-500 hover:bg-indigo-600 border-indigo-600 text-white',
  booked: 'bg-red-100 border-red-300 cursor-not-allowed'
} as const

export const NAV_ITEMS = [
  { label: 'Фильмы', to: APP_ROUTES.MOVIES.INDEX, icon: 'i-lucide-film' },
  { label: 'Кинотеатры', to: APP_ROUTES.CINEMAS.INDEX, icon: 'i-lucide-building-2' },
  { label: 'Мои билеты', to: APP_ROUTES.MY_TICKETS, icon: 'i-lucide-ticket' }
] as const

export const AUTH_NAV_ITEMS = {
  login: { label: 'Вход', to: APP_ROUTES.AUTH.LOGIN, icon: 'i-lucide-log-in' },
  logout: { label: 'Выход', icon: 'i-lucide-log-out' }
} as const
