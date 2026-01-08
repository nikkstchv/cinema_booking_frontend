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
    // Refresh on window focus to get latest booked seats
    refetchOnWindowFocus: true,
    // Short stale time for seat availability
    staleTime: 10 * 1000 // 10 seconds
  })
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
      if (isProcessingRef.value) {
        throw new Error('Бронирование уже выполняется')
      }
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

      const conflictingSeats = seats.filter(seat =>
        previous.bookedSeats.some(
          booked => booked.rowNumber === seat.rowNumber && booked.seatNumber === seat.seatNumber
        )
      )

      if (conflictingSeats.length > 0) {
        isProcessingRef.value = false
        throw new Error('Некоторые места уже забронированы')
      }

      queryClient.setQueryData<MovieSessionDetails>(
        queryKeys.sessions.detail(id.value),
        (old) => {
          if (!old) return previous
          const hasConflict = seats.some(seat =>
            old.bookedSeats.some(
              booked => booked.rowNumber === seat.rowNumber && booked.seatNumber === seat.seatNumber
            )
          )
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

      if (err instanceof Error && (err.message.includes('не найдены') || err.message.includes('уже забронированы') || err.message.includes('уже выполняется'))) {
        toast.add({
          title: 'Ошибка бронирования',
          description: err.message,
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
    }
  })
}

/**
 * Get multiple session details by IDs
 */
export function useSessionsBatch(sessionIds: Ref<number[]>) {
  const ids = computed(() => sessionIds.value)

  return useQuery({
    queryKey: computed(() => [...queryKeys.sessions.detail(0), 'batch', ids.value]),
    queryFn: async ({ signal }) => {
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
    staleTime: 60 * 1000
  })
}
