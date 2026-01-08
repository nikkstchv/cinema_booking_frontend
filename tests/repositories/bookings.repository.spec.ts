import { describe, it, expect, beforeEach, vi } from 'vitest'
import { bookingsRepository } from '~/shared/api/repositories'
import { useApiClient, ApiError } from '~/shared/api/client'
import type { Booking } from '~/shared/schemas'

vi.mock('~/shared/api/client', () => ({
  useApiClient: vi.fn(),
  ApiError: class ApiError extends Error {
    constructor(message: string, public status: number) {
      super(message)
      this.name = 'ApiError'
    }
  }
}))

describe('bookingsRepository', () => {
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

  describe('getMyBookings', () => {
    it('fetches bookings from API', async () => {
      const mockBookings: Booking[] = [
        {
          id: '1',
          userId: 1,
          movieSessionId: 1,
          bookedAt: '2024-01-01T10:00:00Z',
          seats: [{ rowNumber: 1, seatNumber: 1 }],
          isPaid: false
        }
      ]
      mockClient.get.mockResolvedValue(mockBookings)

      const result = await bookingsRepository.getMyBookings()

      expect(mockClient.get).toHaveBeenCalledWith('/me/bookings', expect.anything())
      expect(result).toEqual(mockBookings)
    })

    it('throws ApiError on invalid response', async () => {
      mockClient.get.mockResolvedValue([{ invalid: 'data' }])

      await expect(bookingsRepository.getMyBookings()).rejects.toThrow(ApiError)
    })
  })

  describe('pay', () => {
    it('calls pay endpoint', async () => {
      const bookingId = 'booking-123'
      const mockResponse = { message: 'Payment successful' }
      mockClient.post.mockResolvedValue(mockResponse)

      const result = await bookingsRepository.pay(bookingId)

      expect(mockClient.post).toHaveBeenCalledWith(
        `/bookings/${bookingId}/payments`,
        {},
        expect.anything()
      )
      expect(result).toEqual(mockResponse)
    })

    it('throws ApiError on invalid response', async () => {
      const bookingId = 'booking-123'
      mockClient.post.mockResolvedValue({ invalid: 'data' })

      await expect(bookingsRepository.pay(bookingId)).rejects.toThrow(ApiError)
    })
  })
})
