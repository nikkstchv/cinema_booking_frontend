import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useMyBookings, usePayBooking, useSettings } from '~/features/bookings/composables/useBookings'
import { bookingsRepository, settingsRepository } from '~/shared/api/repositories'
import type { Booking } from '~/shared/schemas'

vi.mock('~/shared/api/repositories', () => ({
  bookingsRepository: {
    getMyBookings: vi.fn(),
    pay: vi.fn()
  },
  settingsRepository: {
    get: vi.fn()
  }
}))

vi.mock('#app', () => ({
  useToast: vi.fn(() => ({
    add: vi.fn()
  })),
  useErrorHandler: vi.fn(() => ({
    handleError: vi.fn()
  }))
}))

describe('useBookings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useMyBookings', () => {
    it('fetches bookings from repository', async () => {
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
      vi.mocked(bookingsRepository.getMyBookings).mockResolvedValue(mockBookings)

      useMyBookings()

      await new Promise(resolve => setTimeout(resolve, 0))

      expect(bookingsRepository.getMyBookings).toHaveBeenCalled()
    })
  })

  describe('useSettings', () => {
    it('fetches settings from repository', async () => {
      const mockSettings = { bookingPaymentTimeSeconds: 180 }
      vi.mocked(settingsRepository.get).mockResolvedValue(mockSettings)

      useSettings()

      await new Promise(resolve => setTimeout(resolve, 0))

      expect(settingsRepository.get).toHaveBeenCalled()
    })
  })

  describe('usePayBooking', () => {
    it('calls pay repository on mutation', async () => {
      vi.mocked(bookingsRepository.pay).mockResolvedValue({ message: 'Success' })

      const { mutate } = usePayBooking()
      mutate('booking-id')

      await new Promise(resolve => setTimeout(resolve, 0))

      expect(bookingsRepository.pay).toHaveBeenCalledWith('booking-id')
    })
  })
})
