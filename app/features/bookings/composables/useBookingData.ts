import { useMovies } from '~/features/movies/composables/useMovies'
import { useCinemas } from '~/features/cinemas/composables/useCinemas'
import { useSessionsBatch } from '~/features/sessions/composables/useSessions'
import type { Booking } from '~/shared/schemas'

export function useBookingData(bookings: Ref<Booking[]>) {
  const { data: movies } = useMovies()
  const { data: cinemas } = useCinemas()

  const sessionIds = computed(() => {
    if (!bookings.value?.length) return []
    return [...new Set(bookings.value.map(b => b.movieSessionId))]
  })

  const { data: sessions } = useSessionsBatch(sessionIds)

  const getMovie = (booking: Booking) => {
    const session = sessions.value?.find(s => s.id === booking.movieSessionId)
    return movies.value?.find(m => m.id === session?.movieId)
  }

  const getCinema = (booking: Booking) => {
    const session = sessions.value?.find(s => s.id === booking.movieSessionId)
    return cinemas.value?.find(c => c.id === session?.cinemaId)
  }

  const getSession = (booking: Booking) => {
    return sessions.value?.find(s => s.id === booking.movieSessionId)
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
