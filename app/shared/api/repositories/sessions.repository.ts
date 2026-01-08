import { useApiClient, ApiError } from '../client'
import { MovieSessionDetailsSchema, BookingResponseSchema, type MovieSessionDetails, type Seat, type BookingResponse } from '../../schemas'
import { logger } from '../../lib/logger'

export const sessionsRepository = {
  async getById(sessionId: number, signal?: AbortSignal): Promise<MovieSessionDetails> {
    const client = useApiClient()
    const response = await client.get<unknown>(`/movieSessions/${sessionId}`, { signal })

    const result = MovieSessionDetailsSchema.safeParse(response)
    if (!result.success) {
      logger.error('Session details response validation failed:', result.error)
      throw new ApiError('Invalid session details response', 500)
    }

    return result.data
  },

  async book(sessionId: number, seats: Seat[], signal?: AbortSignal): Promise<BookingResponse> {
    const client = useApiClient()
    const response = await client.post<unknown>(
      `/movieSessions/${sessionId}/bookings`,
      { seats },
      { signal }
    )

    const result = BookingResponseSchema.safeParse(response)
    if (!result.success) {
      logger.error('Booking response validation failed:', result.error)
      throw new ApiError('Invalid booking response', 500)
    }

    return result.data
  }
}
