import { useApiClient, ApiError } from '../client'
import { MovieSessionDetailsSchema, type MovieSessionDetails, type Seat } from '../../schemas'

interface BookingResponse {
  bookingId: string
}

export const sessionsRepository = {
  async getById(sessionId: number, signal?: AbortSignal): Promise<MovieSessionDetails> {
    const client = useApiClient()
    const response = await client.get<unknown>(`/movieSessions/${sessionId}`, { signal })

    const result = MovieSessionDetailsSchema.safeParse(response)
    if (!result.success) {
      console.error('Session details response validation failed:', result.error)
      throw new ApiError('Invalid session details response', 500)
    }

    return result.data
  },

  async book(sessionId: number, seats: Seat[], signal?: AbortSignal): Promise<BookingResponse> {
    const client = useApiClient()
    const response = await client.post<BookingResponse>(
      `/movieSessions/${sessionId}/bookings`,
      { seats },
      { signal }
    )

    return response
  }
}
