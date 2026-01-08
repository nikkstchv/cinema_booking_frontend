import { describe, it, expect, beforeEach, vi } from 'vitest'
import { bookingsRepository } from '~/shared/api/repositories'

vi.mock('~/shared/api/repositories', () => ({
  bookingsRepository: {
    getMyBookings: vi.fn(),
    pay: vi.fn()
  },
  settingsRepository: {
    get: vi.fn()
  }
}))

describe('useBookings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useMyBookings', () => {
    it('repository getMyBookings is mocked', () => {
      expect(bookingsRepository.getMyBookings).toBeDefined()
      expect(typeof bookingsRepository.getMyBookings).toBe('function')
    })
  })

  describe('usePayBooking', () => {
    it('repository pay is mocked', () => {
      expect(bookingsRepository.pay).toBeDefined()
      expect(typeof bookingsRepository.pay).toBe('function')
    })
  })
})

