import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { sessionsRepository } from '~/shared/api/repositories'
import { queryKeys } from '~/shared/lib/query-keys'
import { RETRY_CONFIG, shouldRetry } from '~/shared/lib/retry-config'
import type { Seat, MovieSessionDetails, MovieSession } from '~/shared/schemas'

/**
 * Get session details with booked seats
 */
export function useSessionDetails(sessionId: number | Ref<number>) {
  const id = computed(() => toValue(sessionId))

  return useQuery({
    queryKey: computed(() => queryKeys.sessions.detail(id.value)),
    queryFn: ({ signal }) => sessionsRepository.getById(id.value, signal),
    enabled: computed(() => id.value > 0),
    refetchOnWindowFocus: true,
    staleTime: 10 * 1000,
    gcTime: 2 * 60 * 1000
  })
}

const BOOKING_ERROR_MESSAGES = {
  NOT_FOUND: 'не найдены',
  ALREADY_BOOKED: 'уже забронированы',
  IN_PROGRESS: 'уже выполняется'
} as const

function hasSeatConflict(seat: Seat, bookedSeats: Seat[]): boolean {
  return bookedSeats.some(
    booked => booked.rowNumber === seat.rowNumber && booked.seatNumber === seat.seatNumber
  )
}

function findConflictingSeats(seats: Seat[], bookedSeats: Seat[]): Seat[] {
  return seats.filter(seat => hasSeatConflict(seat, bookedSeats))
}

function isBookingError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  const message = error.message
  return Object.values(BOOKING_ERROR_MESSAGES).some(msg => message.includes(msg))
}

/**
 * Book seats for a session
 */
export function useBookSession(sessionId: number | Ref<number>) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const { handleError } = useErrorHandler()
  const id = computed(() => toValue(sessionId))

  const isProcessingRef = ref(false)

  return useMutation({
    mutationFn: (seats: Seat[]) => {
      return sessionsRepository.book(id.value, seats)
    },

    retry: (failureCount, error) => {
      return shouldRetry(error, failureCount, RETRY_CONFIG.critical.retries)
    },
    retryDelay: RETRY_CONFIG.critical.retryDelay,

    onMutate: async (seats) => {
      if (isProcessingRef.value) {
        throw new Error('Бронирование уже выполняется')
      }

      isProcessingRef.value = true

      await queryClient.cancelQueries({ queryKey: queryKeys.sessions.detail(id.value) })

      const previous = queryClient.getQueryData<MovieSessionDetails>(
        queryKeys.sessions.detail(id.value)
      )

      if (!previous) {
        isProcessingRef.value = false
        throw new Error('Данные сеанса не найдены')
      }

      const conflictingSeats = findConflictingSeats(seats, previous.bookedSeats)

      if (conflictingSeats.length > 0) {
        isProcessingRef.value = false
        throw new Error('Некоторые места уже забронированы')
      }

      queryClient.setQueryData<MovieSessionDetails>(
        queryKeys.sessions.detail(id.value),
        (old) => {
          if (!old) return previous
          const hasConflict = seats.some(seat => hasSeatConflict(seat, old.bookedSeats))
          if (hasConflict) {
            return previous
          }
          return {
            ...old,
            bookedSeats: [...old.bookedSeats, ...seats]
          }
        }
      )

      return { previous, seats }
    },

    onError: (err, _seats, context) => {
      isProcessingRef.value = false

      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.sessions.detail(id.value),
          context.previous
        )
      }

      if (isBookingError(err)) {
        toast.add({
          title: 'Ошибка бронирования',
          description: err instanceof Error ? err.message : 'Произошла ошибка при бронировании',
          color: 'red',
          icon: 'i-lucide-alert-circle'
        })
      } else {
        handleError(err)
      }
    },

    onSuccess: () => {
      isProcessingRef.value = false

      toast.add({
        title: 'Места забронированы!',
        description: 'Оплатите билеты в течение отведённого времени',
        color: 'green',
        icon: 'i-lucide-check-circle'
      })

      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.detail(id.value) })
    }
  })
}

/**
 * Get multiple session details by IDs
 * Optimized to use parallel requests with proper caching
 */
export function useSessionsBatch(sessionIds: Ref<number[]>) {
  const ids = computed(() => {
    const uniqueIds = [...new Set(sessionIds.value)]
    const filtered = uniqueIds.filter(id => id > 0)
    return filtered.sort((a, b) => a - b)
  })

  return useQuery({
    queryKey: computed(() => ['sessions', 'batch', ids.value]),
    queryFn: async ({ signal }) => {
      if (ids.value.length === 0) {
        return []
      }

      const sessionDetails = await Promise.all(
        ids.value.map(id => sessionsRepository.getById(id, signal))
      )

      return sessionDetails.map((s): MovieSession => ({
        id: s.id,
        movieId: s.movieId,
        cinemaId: s.cinemaId,
        startTime: s.startTime
      }))
    },
    enabled: computed(() => ids.value.length > 0),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000
  })
}
