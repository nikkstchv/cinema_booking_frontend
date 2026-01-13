import { useMovies } from '~/features/movies'
import { useCinemas } from '~/features/cinemas'
import { useSessionsBatch } from '~/features/sessions'
import type { Booking, Movie, Cinema, MovieSession } from '~/shared/schemas'
import { createEntityMap } from '~/shared/lib/normalize'

export function useBookingData(bookings: Ref<Booking[]>) {
  const { data: movies } = useMovies()
  const { data: cinemas } = useCinemas()

  const sessionIds = computed(() => {
    if (!bookings.value?.length) return []
    return [...new Set(bookings.value.map(booking => booking.movieSessionId))]
  })

  const { data: sessions } = useSessionsBatch(sessionIds)

  const moviesMap = createEntityMap<Movie>(movies)
  const cinemasMap = createEntityMap<Cinema>(cinemas)
  const sessionsMap = computed(() => {
    if (!sessions.value) {
      return new Map<number, MovieSession>()
    }
    const map = new Map<number, MovieSession>()
    sessions.value.forEach((session) => {
      map.set(session.id, session)
    })
    return map
  })

  const getSession = (booking: Booking): MovieSession | undefined => {
    return sessionsMap.value.get(booking.movieSessionId)
  }

  const getMovie = (booking: Booking): Movie | undefined => {
    const session = getSession(booking)
    if (!session) {
      return undefined
    }
    return moviesMap.value.get(session.movieId)
  }

  const getCinema = (booking: Booking): Cinema | undefined => {
    const session = getSession(booking)
    if (!session) {
      return undefined
    }
    return cinemasMap.value.get(session.cinemaId)
  }

  return {
    movies: computed(() => movies.value ?? []),
    cinemas: computed(() => cinemas.value ?? []),
    sessions: computed(() => sessions.value ?? []),
    getMovie,
    getCinema,
    getSession
  }
}
