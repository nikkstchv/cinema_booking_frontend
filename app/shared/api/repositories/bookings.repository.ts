import { z } from 'zod'
import { useApiClient, ApiError } from '../client'
import { BookingSchema, PaymentResponseSchema, type Booking, type PaymentResponse } from '../../schemas'
import { logger } from '../../lib/logger'

export const bookingsRepository = {
  async getMyBookings(signal?: AbortSignal): Promise<Booking[]> {
    const client = useApiClient()
    const response = await client.get<unknown>('/me/bookings', { signal })

    const result = z.array(BookingSchema).safeParse(response)
    if (!result.success) {
      logger.error('Bookings response validation failed:', result.error)
      throw new ApiError('Invalid bookings response', 500)
    }

    return result.data
  },

  async pay(bookingId: string, signal?: AbortSignal): Promise<PaymentResponse> {
    const client = useApiClient()
    const response = await client.post<unknown>(
      `/bookings/${bookingId}/payments`,
      {},
      { signal }
    )

    const result = PaymentResponseSchema.safeParse(response)
    if (!result.success) {
      logger.error('Payment response validation failed:', result.error)
      throw new ApiError('Invalid payment response', 500)
    }

    return result.data
  }
}
