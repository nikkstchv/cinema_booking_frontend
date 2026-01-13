export const APP_ROUTES = {
  HOME: '/',
  MOVIES: {
    INDEX: '/movies',
    DETAIL: (movieId: number) => `/movies/${movieId}`
  },
  CINEMAS: {
    INDEX: '/cinemas',
    DETAIL: (cinemaId: number) => `/cinemas/${cinemaId}`
  },
  SESSIONS: {
    DETAIL: (sessionId: number) => `/sessions/${sessionId}`
  },
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register'
  },
  MY_TICKETS: '/my-tickets'
} as const
