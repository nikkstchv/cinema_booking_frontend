import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import TicketCard from '~/features/bookings/components/TicketCard.vue'
import type { Booking, Movie, Cinema, MovieSession } from '~/shared/schemas'

vi.mock('~/composables/useCountdown', () => ({
  useCountdown: () => ({
    formattedTime: { value: '2:30' },
    isExpired: { value: false },
    remainingSeconds: { value: 150 },
    reset: vi.fn()
  })
}))

describe('TicketCard', () => {
  let mockBooking: Booking
  let mockMovie: Movie
  let mockCinema: Cinema
  let mockSession: MovieSession

  beforeEach(() => {
    vi.clearAllMocks()

    mockBooking = {
      id: '1',
      userId: 1,
      movieSessionId: 1,
      bookedAt: new Date().toISOString(),
      seats: [{ rowNumber: 1, seatNumber: 1 }],
      isPaid: false
    }

    mockMovie = {
      id: 1,
      title: 'Test Movie',
      description: 'Description',
      year: 2020,
      lengthMinutes: 120,
      posterImage: '/poster.jpg',
      rating: 8.5
    }

    mockCinema = {
      id: 1,
      name: 'Test Cinema',
      address: 'Address'
    }

    mockSession = {
      id: 1,
      movieId: 1,
      cinemaId: 1,
      startTime: new Date().toISOString()
    }
  })

  describe('rendering', () => {
    it('renders ticket information', () => {
      const wrapper = mount(TicketCard, {
        props: {
          booking: mockBooking,
          movie: mockMovie,
          cinema: mockCinema,
          session: mockSession,
          paymentTimeoutSeconds: 180
        },
        global: {
          stubs: {
            PaymentTimer: true
          }
        }
      })

      expect(wrapper.exists()).toBe(true)
    })
  })
})
