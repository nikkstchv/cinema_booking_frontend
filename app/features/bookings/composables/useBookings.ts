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

  const isProcessingRef = ref(false)

  return useMutation({
    mutationFn: (bookingId: string) => {
      if (isProcessingRef.value) {
        throw new Error('Оплата уже выполняется')
      }
      return bookingsRepository.pay(bookingId)
    },

    retry: (failureCount, error) => {
      return shouldRetry(error, failureCount, RETRY_CONFIG.critical.retries)
    },
    retryDelay: RETRY_CONFIG.critical.retryDelay,

    onMutate: async (bookingId) => {
      if (isProcessingRef.value) {
        throw new Error('Оплата уже выполняется')
      }

      isProcessingRef.value = true

      await queryClient.cancelQueries({ queryKey: queryKeys.bookings.all })

      const previous = queryClient.getQueryData<Booking[]>(queryKeys.bookings.all)

      const booking = previous?.find(b => b.id === bookingId)
      if (!booking) {
        isProcessingRef.value = false
        throw new Error('Билет не найден')
      }
      if (booking.isPaid) {
        isProcessingRef.value = false
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
      isProcessingRef.value = false

      if (context?.previous) {
        queryClient.setQueryData(queryKeys.bookings.all, context.previous)
      }

      if (err instanceof Error && (err.message.includes('не найден') || err.message.includes('уже оплачен') || err.message.includes('уже выполняется'))) {
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
      isProcessingRef.value = false

      toast.add({
        title: 'Билет оплачен!',
        description: 'Спасибо за покупку',
        color: 'green',
        icon: 'i-lucide-check-circle'
      })

      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all })
    }
  })
}
