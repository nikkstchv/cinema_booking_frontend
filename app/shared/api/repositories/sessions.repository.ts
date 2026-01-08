import { useApiClient, ApiError } from '../client'
import { MovieSessionDetailsSchema, BookingResponseSchema, type MovieSessionDetails, type Seat, type BookingResponse } from '../../schemas'
import { logger } from '../../lib/logger'

export const sessionsRepository = {
  async getById(sessionId: number, signal?: AbortSignal): Promise<MovieSessionDetails> {
    const client = useApiClient()
    const response = await client.get(`/movieSessions/${sessionId}`, { signal })

    const result = MovieSessionDetailsSchema.safeParse(response)
    if (!result.success) {
      const errorDetails = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      logger.error('Session details response validation failed:', result.error)
      throw new ApiError(`Неверный формат ответа сервера при получении деталей сеанса: ${errorDetails}`, 500)
    }

    return result.data
  },

  async book(sessionId: number, seats: Seat[], signal?: AbortSignal): Promise<BookingResponse> {
    const client = useApiClient()
    const response = await client.post(
      `/movieSessions/${sessionId}/bookings`,
      { seats },
      { signal }
    )

    const result = BookingResponseSchema.safeParse(response)
    if (!result.success) {
      const errorDetails = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      logger.error('Booking response validation failed:', result.error)
      throw new ApiError(`Неверный формат ответа сервера при бронировании: ${errorDetails}`, 500)
    }

    return result.data
  }
}
