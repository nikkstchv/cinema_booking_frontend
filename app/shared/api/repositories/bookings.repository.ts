import { z } from 'zod'
import { useApiClient, ApiError } from '../client'
import { BookingSchema, type Booking } from '../../schemas'

interface PaymentResponse {
  message: string
}

export const bookingsRepository = {
  async getMyBookings(signal?: AbortSignal): Promise<Booking[]> {
    const client = useApiClient()
    const response = await client.get<unknown>('/me/bookings', { signal })

    const result = z.array(BookingSchema).safeParse(response)
    if (!result.success) {
      console.error('Bookings response validation failed:', result.error)
      throw new ApiError('Invalid bookings response', 500)
    }

    return result.data
  },

  async pay(bookingId: string, signal?: AbortSignal): Promise<PaymentResponse> {
    const client = useApiClient()
    const response = await client.post<PaymentResponse>(
      `/bookings/${bookingId}/payments`,
      {},
      { signal }
    )

    return response
  }
}
