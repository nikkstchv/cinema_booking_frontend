import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import TicketsList from '~/features/bookings/components/TicketsList.vue'
import type { Booking } from '~/shared/schemas'

vi.mock('~/features/movies/composables/useMovies', () => ({
  useMovies: () => ({
    data: { value: [] }
  })
}))

vi.mock('~/features/cinemas/composables/useCinemas', () => ({
  useCinemas: () => ({
    data: { value: [] }
  })
}))

vi.mock('~/features/sessions/composables/useSessions', () => ({
  useSessionsBatch: () => ({
    data: { value: [] }
  })
}))

describe('TicketsList', () => {
  const mockBookings: Booking[] = [
    {
      id: '1',
      userId: 1,
      movieSessionId: 1,
      bookedAt: new Date().toISOString(),
      seats: [{ rowNumber: 1, seatNumber: 1 }],
      isPaid: false
    },
    {
      id: '2',
      userId: 1,
      movieSessionId: 2,
      bookedAt: new Date().toISOString(),
      seats: [{ rowNumber: 2, seatNumber: 2 }],
      isPaid: true
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders bookings grouped by category', () => {
    const wrapper = mount(TicketsList, {
      props: {
        bookings: mockBookings,
        paymentTimeoutSeconds: 180
      },
      global: {
        stubs: {
          TicketCard: true
        }
      }
    })

    const headings = wrapper.findAll('h2')
    expect(headings.length).toBeGreaterThan(0)
  })

  it('shows empty state when no bookings', () => {
    const wrapper = mount(TicketsList, {
      props: {
        bookings: [],
        paymentTimeoutSeconds: 180
      }
    })

    expect(wrapper.text()).toContain('У вас пока нет билетов')
  })

  it('shows loading state', () => {
    const wrapper = mount(TicketsList, {
      props: {
        bookings: [],
        paymentTimeoutSeconds: 180,
        loading: true
      }
    })

    expect(wrapper.find('.space-y-4').exists()).toBe(true)
  })

  it('emits pay event', async () => {
    const wrapper = mount(TicketsList, {
      props: {
        bookings: mockBookings,
        paymentTimeoutSeconds: 180
      },
      global: {
        stubs: {
          TicketCard: {
            template: '<div @click="$emit(\'pay\')">Pay</div>',
            emits: ['pay']
          }
        }
      }
    })

    const ticketCard = wrapper.findComponent({ name: 'TicketCard' })
    await ticketCard.vm.$emit('pay')

    expect(wrapper.emitted('pay')).toBeTruthy()
  })

  it('emits expired event', async () => {
    const wrapper = mount(TicketsList, {
      props: {
        bookings: mockBookings,
        paymentTimeoutSeconds: 180
      },
      global: {
        stubs: {
          TicketCard: {
            template: '<div @click="$emit(\'expired\')">Expired</div>',
            emits: ['expired']
          }
        }
      }
    })

    const ticketCard = wrapper.findComponent({ name: 'TicketCard' })
    await ticketCard.vm.$emit('expired')

    expect(wrapper.emitted('expired')).toBeTruthy()
  })
})
