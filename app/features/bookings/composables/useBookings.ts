import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { bookingsRepository, settingsRepository } from '~/shared/api/repositories'
import { queryKeys } from '~/shared/lib/query-keys'
import type { Booking } from '~/shared/schemas'

/**
 * Get current user's bookings
 */
export function useMyBookings() {
  return useQuery({
    queryKey: queryKeys.bookings.all,
    queryFn: ({ signal }) => bookingsRepository.getMyBookings(signal)
  })
}

/**
 * Get app settings (payment timeout)
 */
export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: ({ signal }) => settingsRepository.get(signal),
    staleTime: 1000 * 60 * 5 // 5 minutes
  })
}

/**
 * Pay for a booking
 */
export function usePayBooking() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const { handleError } = useErrorHandler()

  return useMutation({
    mutationFn: (bookingId: string) =>
      bookingsRepository.pay(bookingId),

    // Retry for critical payment operations
    retry: 3,
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 10000),

    onMutate: async (bookingId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.bookings.all })

      // Snapshot previous value
      const previous = queryClient.getQueryData<Booking[]>(queryKeys.bookings.all)

      // Optimistically update isPaid
      if (previous) {
        queryClient.setQueryData<Booking[]>(queryKeys.bookings.all, old =>
          old?.map(b => b.id === bookingId ? { ...b, isPaid: true } : b)
        )
      }

      return { previous }
    },

    onError: (err, _bookingId, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.bookings.all, context.previous)
      }
      handleError(err)
    },

    onSuccess: () => {
      toast.add({
        title: 'Билет оплачен!',
        description: 'Спасибо за покупку',
        color: 'green',
        icon: 'i-lucide-check-circle'
      })

      // Invalidate to get fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all })
    }
  })
}
