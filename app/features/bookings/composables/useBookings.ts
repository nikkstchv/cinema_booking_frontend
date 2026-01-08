import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { bookingsRepository, settingsRepository } from '~/shared/api/repositories'
import { queryKeys } from '~/shared/lib/query-keys'
import { RETRY_CONFIG, shouldRetry } from '~/shared/lib/retry-config'
import type { Booking } from '~/shared/schemas'

/**
 * Get current user's bookings
 */
export function useMyBookings() {
  return useQuery({
    queryKey: queryKeys.bookings.all,
    queryFn: ({ signal }) => bookingsRepository.getMyBookings(signal),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true
  })
}

/**
 * Get app settings (payment timeout)
 */
export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: ({ signal }) => settingsRepository.get(signal),
    staleTime: 1000 * 60 * 5,
    gcTime: 10 * 60 * 1000
  })
}

/**
 * Pay for a booking
 */
export function usePayBooking() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const { handleError } = useErrorHandler()

  const mutation = useMutation({
    mutationFn: (bookingId: string) => {
      return bookingsRepository.pay(bookingId)
    },

    retry: (failureCount, error) => {
      return shouldRetry(error, failureCount, RETRY_CONFIG.critical.retries)
    },
    retryDelay: RETRY_CONFIG.critical.retryDelay,

    onMutate: async (bookingId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.bookings.all })

      const previous = queryClient.getQueryData<Booking[]>(queryKeys.bookings.all)

      const booking = previous?.find(b => b.id === bookingId)
      if (!booking) {
        throw new Error('Билет не найден')
      }
      if (booking.isPaid) {
        throw new Error('Билет уже оплачен')
      }

      queryClient.setQueryData<Booking[]>(queryKeys.bookings.all, (old) => {
        if (!old) return old
        const currentBooking = old.find(b => b.id === bookingId)
        if (!currentBooking || currentBooking.isPaid !== booking.isPaid) {
          return previous
        }
        return old.map(b => b.id === bookingId ? { ...b, isPaid: true } : b)
      })

      return { previous, bookingId }
    },

    onError: (err, bookingId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.bookings.all, context.previous)
      }

      if (err instanceof Error && (err.message.includes('не найден') || err.message.includes('уже оплачен'))) {
        toast.add({
          title: 'Ошибка оплаты',
          description: err.message,
          color: 'red',
          icon: 'i-lucide-alert-circle'
        })
      } else {
        handleError(err)
      }
    },

    onSuccess: () => {
      toast.add({
        title: 'Билет оплачен!',
        description: 'Спасибо за покупку',
        color: 'green',
        icon: 'i-lucide-check-circle'
      })

      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all })
    }
  })

  return mutation
}
