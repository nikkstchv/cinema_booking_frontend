import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useMyBookings, usePayBooking, useSettings } from '~/features/bookings/composables/useBookings'
import { bookingsRepository, settingsRepository } from '~/shared/api/repositories'
import type { Booking } from '~/shared/schemas'
import { ApiError } from '~/shared/api/client'

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

const waitForQuery = async (isLoading: { value: boolean }, timeout = 5000) => {
  const startTime = Date.now()
  while (isLoading.value && Date.now() - startTime < timeout) {
    await new Promise(resolve => setTimeout(resolve, 10))
  }
}

describe('useBookings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useMyBookings', () => {
    context('when fetch succeeds', () => {
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

        const result = useMyBookings()

        await waitForQuery(result.isLoading)

        expect(bookingsRepository.getMyBookings).toHaveBeenCalledTimes(1)
        expect(result.data.value).toEqual(mockBookings)
      })
    })

    context('when fetch fails', () => {
      it('handles fetch error', async () => {
        const error = new ApiError('Failed to fetch bookings', 500)
        vi.mocked(bookingsRepository.getMyBookings).mockRejectedValue(error)

        const result = useMyBookings()

        await waitForQuery(result.isLoading)

        expect(result.error.value).toBeDefined()
      })
    })
  })

  describe('useSettings', () => {
    context('when fetch succeeds', () => {
      it('fetches settings from repository', async () => {
        const mockSettings = { bookingPaymentTimeSeconds: 180 }
        vi.mocked(settingsRepository.get).mockResolvedValue(mockSettings)

        const result = useSettings()

        await waitForQuery(result.isLoading)

        expect(settingsRepository.get).toHaveBeenCalledTimes(1)
        expect(result.data.value).toEqual(mockSettings)
      })
    })

    context('when fetch fails', () => {
      it('handles fetch error', async () => {
        const error = new ApiError('Failed to fetch settings', 500)
        vi.mocked(settingsRepository.get).mockRejectedValue(error)

        const result = useSettings()

        await waitForQuery(result.isLoading)

        expect(result.error.value).toBeDefined()
      })
    })
  })

  describe('usePayBooking', () => {
    context('when payment succeeds', () => {
      it('calls pay repository on mutation', async () => {
        vi.mocked(bookingsRepository.pay).mockResolvedValue({ message: 'Success' })

        const { mutate } = usePayBooking()
        mutate('booking-id')

        await new Promise(resolve => setTimeout(resolve, 50))

        expect(bookingsRepository.pay).toHaveBeenCalledTimes(1)
        expect(bookingsRepository.pay).toHaveBeenCalledWith('booking-id')
      })
    })

    context('when payment fails', () => {
      it('handles payment error', async () => {
        const error = new ApiError('Payment failed', 400)
        vi.mocked(bookingsRepository.pay).mockRejectedValue(error)

        const { mutate } = usePayBooking()
        mutate('booking-id')

        await new Promise(resolve => setTimeout(resolve, 50))

        expect(bookingsRepository.pay).toHaveBeenCalledTimes(1)
      })
    })
  })
})
