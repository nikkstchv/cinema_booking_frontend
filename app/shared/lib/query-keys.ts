export const queryKeys = {
  movies: {
    all: ['movies'] as const,
    detail: (id: number) => ['movies', id] as const,
    sessions: (id: number) => ['movies', id, 'sessions'] as const
  },
  cinemas: {
    all: ['cinemas'] as const,
    detail: (id: number) => ['cinemas', id] as const,
    sessions: (id: number) => ['cinemas', id, 'sessions'] as const
  },
  sessions: {
    detail: (id: number) => ['sessions', id] as const
  },
  bookings: {
    all: ['bookings'] as const
  },
  settings: ['settings'] as const
}
