import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSessionDetails, useBookSession } from '~/features/sessions/composables/useSessions'
import { sessionsRepository } from '~/shared/api/repositories'
import type { MovieSessionDetails, Seat } from '~/shared/schemas'

vi.mock('~/shared/api/repositories', () => ({
  sessionsRepository: {
    getById: vi.fn(),
    book: vi.fn()
  }
}))

vi.mock('#app', () => ({
  useToast: vi.fn(() => ({
    add: vi.fn()
  })),
  useErrorHandler: vi.fn(() => ({
    handleError: vi.fn()
  })),
  computed: vi.fn((fn: () => unknown) => ({ value: fn() })),
  toValue: vi.fn((val: unknown) => val)
}))

describe('useSessions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useSessionDetails', () => {
    it('fetches session details from repository', async () => {
      const mockSession: MovieSessionDetails = {
        id: 1,
        movieId: 1,
        cinemaId: 1,
        startTime: '2024-01-01T10:00:00Z',
        seats: { rows: 5, seatsPerRow: 10 },
        bookedSeats: []
      }
      vi.mocked(sessionsRepository.getById).mockResolvedValue(mockSession)

      useSessionDetails(1)

      await new Promise(resolve => setTimeout(resolve, 0))

      expect(sessionsRepository.getById).toHaveBeenCalledWith(1, expect.anything())
    })

    it('does not fetch when sessionId is 0', () => {
      const { enabled } = useSessionDetails(0)

      expect(enabled.value).toBe(false)
    })
  })

  describe('useBookSession', () => {
    it('calls book repository on mutation', async () => {
      const mockResponse = { bookingId: 'booking-123' }
      vi.mocked(sessionsRepository.book).mockResolvedValue(mockResponse)

      const seats: Seat[] = [{ rowNumber: 1, seatNumber: 1 }]
      const { mutate } = useBookSession(1)
      mutate(seats)

      await new Promise(resolve => setTimeout(resolve, 0))

      expect(sessionsRepository.book).toHaveBeenCalledWith(1, seats)
    })
  })
})
