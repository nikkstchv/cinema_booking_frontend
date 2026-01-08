import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { sessionsRepository } from '~/shared/api/repositories'
import { queryKeys } from '~/shared/lib/query-keys'
import type { Seat, MovieSessionDetails } from '~/shared/schemas'

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

  return useMutation({
    mutationFn: (seats: Seat[]) =>
      sessionsRepository.book(id.value, seats),

    retry: 3,
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 10000),

    onMutate: async (seats) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.sessions.detail(id.value) })

      // Snapshot previous value
      const previous = queryClient.getQueryData<MovieSessionDetails>(
        queryKeys.sessions.detail(id.value)
      )

      // Optimistically update booked seats
      if (previous) {
        queryClient.setQueryData<MovieSessionDetails>(
          queryKeys.sessions.detail(id.value),
          {
            ...previous,
            bookedSeats: [...previous.bookedSeats, ...seats]
          }
        )
      }

      return { previous }
    },

    onError: (err, _seats, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.sessions.detail(id.value),
          context.previous
        )
      }
      handleError(err)
    },

    onSuccess: () => {
      toast.add({
        title: 'Места забронированы!',
        description: 'Оплатите билеты в течение отведённого времени',
        color: 'green',
        icon: 'i-lucide-check-circle'
      })

      // Invalidate bookings query to refresh my tickets
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all })
    }
  })
}
