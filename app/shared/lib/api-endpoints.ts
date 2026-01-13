export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register'
  },
  MOVIES: {
    ALL: '/movies',
    SESSIONS: (movieId: number) => `/movies/${movieId}/sessions`
  },
  CINEMAS: {
    ALL: '/cinemas',
    SESSIONS: (cinemaId: number) => `/cinemas/${cinemaId}/sessions`
  },
  SESSIONS: {
    DETAIL: (sessionId: number) => `/movieSessions/${sessionId}`,
    BOOKINGS: (sessionId: number) => `/movieSessions/${sessionId}/bookings`
  },
  BOOKINGS: {
    MY: '/me/bookings',
    PAYMENTS: (bookingId: string) => `/bookings/${bookingId}/payments`
  },
  SETTINGS: {
    GET: '/settings'
  }
} as const
