import { describe, it, expect, beforeEach, vi } from 'vitest'
import { sessionsRepository } from '~/shared/api/repositories'
import { useApiClient, ApiError } from '~/shared/api/client'
import type { MovieSessionDetails, Seat } from '~/shared/schemas'

vi.mock('~/shared/api/client', () => ({
  useApiClient: vi.fn(),
  ApiError: class ApiError extends Error {
    constructor(message: string, public status: number) {
      super(message)
      this.name = 'ApiError'
    }
  }
}))

describe('sessionsRepository', () => {
  let mockClient: {
    get: ReturnType<typeof vi.fn>
    post: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockClient = {
      get: vi.fn(),
      post: vi.fn()
    }
    vi.mocked(useApiClient).mockReturnValue(mockClient as ReturnType<typeof useApiClient>)
  })

  describe('getById', () => {
    it('fetches session details from API', async () => {
      const sessionId = 1
      const mockSession: MovieSessionDetails = {
        id: sessionId,
        movieId: 1,
        cinemaId: 1,
        startTime: '2024-01-01T10:00:00Z',
        seats: { rows: 5, seatsPerRow: 10 },
        bookedSeats: []
      }
      mockClient.get.mockResolvedValue(mockSession)

      const result = await sessionsRepository.getById(sessionId)

      expect(mockClient.get).toHaveBeenCalledWith(`/movieSessions/${sessionId}`, expect.anything())
      expect(result).toEqual(mockSession)
    })

    it('throws ApiError on invalid response', async () => {
      const sessionId = 1
      mockClient.get.mockResolvedValue({ invalid: 'data' })

      await expect(sessionsRepository.getById(sessionId)).rejects.toThrow(ApiError)
    })
  })

  describe('book', () => {
    it('calls book endpoint with seats', async () => {
      const sessionId = 1
      const seats: Seat[] = [{ rowNumber: 1, seatNumber: 1 }]
      const mockResponse = { bookingId: 'booking-123' }
      mockClient.post.mockResolvedValue(mockResponse)

      const result = await sessionsRepository.book(sessionId, seats)

      expect(mockClient.post).toHaveBeenCalledWith(
        `/movieSessions/${sessionId}/bookings`,
        { seats },
        expect.anything()
      )
      expect(result).toEqual(mockResponse)
    })

    it('throws ApiError on invalid response', async () => {
      const sessionId = 1
      const seats: Seat[] = [{ rowNumber: 1, seatNumber: 1 }]
      mockClient.post.mockResolvedValue({ invalid: 'data' })

      await expect(sessionsRepository.book(sessionId, seats)).rejects.toThrow(ApiError)
    })
  })
})
