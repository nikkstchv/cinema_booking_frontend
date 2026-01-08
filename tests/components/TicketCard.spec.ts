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
  const mockBooking: Booking = {
    id: '1',
    userId: 1,
    movieSessionId: 1,
    bookedAt: new Date().toISOString(),
    seats: [{ rowNumber: 1, seatNumber: 1 }],
    isPaid: false
  }

  const mockMovie: Movie = {
    id: 1,
    title: 'Test Movie',
    description: 'Description',
    year: 2020,
    lengthMinutes: 120,
    posterImage: '/poster.jpg',
    rating: 8.5
  }

  const mockCinema: Cinema = {
    id: 1,
    name: 'Test Cinema',
    address: 'Address'
  }

  const mockSession: MovieSession = {
    id: 1,
    movieId: 1,
    cinemaId: 1,
    startTime: new Date().toISOString()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

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

    const payButton = wrapper.find('button')
    expect(payButton.exists()).toBe(true)
    expect(payButton.text()).toContain('Оплатить')
  })

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

    const payButton = wrapper.find('button')
    expect(payButton.exists()).toBe(false)
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

    const payButton = wrapper.find('button')
    await payButton.trigger('click')

    expect(wrapper.emitted('pay')).toBeTruthy()
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

    const payButton = wrapper.find('button')
    expect(payButton.attributes('loading')).toBeDefined()
  })
})
