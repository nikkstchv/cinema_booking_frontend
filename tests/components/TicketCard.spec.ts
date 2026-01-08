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
        }
      })

      expect(wrapper.text()).toContain('Test Movie')
      expect(wrapper.text()).toContain('Test Cinema')
    })
  })

  describe('pay button', () => {
    context('when booking is unpaid', () => {
      it('shows pay button for unpaid booking', () => {
        const wrapper = mount(TicketCard, {
          props: {
            booking: mockBooking,
            movie: mockMovie,
            cinema: mockCinema,
            session: mockSession,
            paymentTimeoutSeconds: 180
          }
        })

        const payButton = wrapper.find('[data-testid="pay-button"]')
        expect(payButton.exists()).toBe(true)
        expect(payButton.text()).toContain('Оплатить')
      })

      it('emits pay event on button click', async () => {
        const wrapper = mount(TicketCard, {
          props: {
            booking: mockBooking,
            movie: mockMovie,
            cinema: mockCinema,
            session: mockSession,
            paymentTimeoutSeconds: 180
          }
        })

        const payButton = wrapper.find('[data-testid="pay-button"]')
        await payButton.trigger('click')

        expect(wrapper.emitted('pay')).toHaveLength(1)
        expect(wrapper.emitted('pay')[0]).toEqual([])
      })

      it('shows loading state when paying', () => {
        const wrapper = mount(TicketCard, {
          props: {
            booking: mockBooking,
            movie: mockMovie,
            cinema: mockCinema,
            session: mockSession,
            paymentTimeoutSeconds: 180,
            payLoading: true
          }
        })

        const payButton = wrapper.find('[data-testid="pay-button"]')
        expect(payButton.attributes('loading')).toBe('true')
      })
    })

    context('when booking is paid', () => {
      it('does not show pay button for paid booking', () => {
        const paidBooking = { ...mockBooking, isPaid: true }
        const wrapper = mount(TicketCard, {
          props: {
            booking: paidBooking,
            movie: mockMovie,
            cinema: mockCinema,
            session: mockSession,
            paymentTimeoutSeconds: 180
          }
        })

        const payButton = wrapper.find('[data-testid="pay-button"]')
        expect(payButton.exists()).toBe(false)
      })
    })
  })
})
