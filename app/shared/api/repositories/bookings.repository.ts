import { z } from 'zod'
import { useApiClient, ApiError } from '../client'
import { BookingSchema, PaymentResponseSchema, type Booking, type PaymentResponse } from '../../schemas'
import { logger } from '../../lib/logger'
import { API_ENDPOINTS } from '../../lib/api-endpoints'

export const bookingsRepository = {
  async getMyBookings(signal?: AbortSignal): Promise<Booking[]> {
    const client = useApiClient()
    const response = await client.get(API_ENDPOINTS.BOOKINGS.MY, { signal })

    const result = z.array(BookingSchema).safeParse(response)
    if (!result.success) {
      const errorDetails = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      logger.error('Bookings response validation failed:', result.error)
      throw new ApiError(`Неверный формат ответа сервера при получении билетов: ${errorDetails}`, 500)
    }

    return result.data
  },

  async pay(bookingId: string, signal?: AbortSignal): Promise<PaymentResponse> {
    const client = useApiClient()
    const response = await client.post(
      API_ENDPOINTS.BOOKINGS.PAYMENTS(bookingId),
      {},
      { signal }
    )

    const result = PaymentResponseSchema.safeParse(response)
    if (!result.success) {
      const errorDetails = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      logger.error('Payment response validation failed:', result.error)
      throw new ApiError(`Неверный формат ответа сервера при оплате: ${errorDetails}`, 500)
    }

    return result.data
  }
}
