import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SeatSelector from '~/features/sessions/components/SeatSelector.vue'
import BookingConfirmation from '~/features/sessions/components/BookingConfirmation.vue'
import type { Seat, SeatsInfo } from '~/shared/schemas'

vi.mock('~/features/movies/composables/useMovies', () => ({
  useMovies: () => ({ data: { value: [] } })
}))

vi.mock('~/features/cinemas/composables/useCinemas', () => ({
  useCinemas: () => ({ data: { value: [] } })
}))

vi.mock('~/features/sessions/composables/useSessions', () => ({
  useSessionsBatch: () => ({ data: { value: [] } })
}))

describe('Booking Flow Integration', () => {
  const seatsInfo: SeatsInfo = {
    rows: 3,
    seatsPerRow: 4
  }

  const bookedSeats: Seat[] = []

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('completes seat selection flow', async () => {
    const seatSelector = mount(SeatSelector, {
      props: {
        seatsInfo,
        bookedSeats,
        isAuthenticated: true
      },
      global: {
        stubs: {
          SeatLegend: true
        }
      }
    })

    await seatSelector.vm.$nextTick()

    const seatButtons = seatSelector.findAll('button[role="gridcell"]')
    const firstFreeSeat = seatButtons.find(btn =>
      !btn.attributes('aria-disabled') && !btn.attributes('disabled')
    )

    if (firstFreeSeat) {
      await firstFreeSeat.trigger('click')
      await seatSelector.vm.$nextTick()
      expect(seatSelector.emitted('update:selected') || seatSelector.emitted('login-required')).toBeTruthy()
    } else {
      expect(seatButtons.length).toBeGreaterThan(0)
    }
  })

  it('shows confirmation with selected seats', () => {
    const selectedSeats: Seat[] = [
      { rowNumber: 1, seatNumber: 1 },
      { rowNumber: 1, seatNumber: 2 }
    ]

    const confirmation = mount(BookingConfirmation, {
      props: {
        seats: selectedSeats,
        movieTitle: 'Test Movie',
        cinemaName: 'Test Cinema',
        sessionTime: '15:30'
      }
    })

    expect(confirmation.text()).toContain('Выбранные места (2)')
    expect(confirmation.text()).toContain('Ряд 1, место 1')
    expect(confirmation.text()).toContain('Ряд 1, место 2')
  })

  it('prevents selecting booked seats', async () => {
    const bookedSeats: Seat[] = [
      { rowNumber: 1, seatNumber: 1 }
    ]

    const seatSelector = mount(SeatSelector, {
      props: {
        seatsInfo,
        bookedSeats
      },
      global: {
        stubs: {
          SeatLegend: true
        }
      }
    })

    const seatButtons = seatSelector.findAll('button[role="gridcell"]')
    const bookedButton = seatButtons.find(btn =>
      btn.attributes('aria-label')?.includes('Ряд 1, место 1')
    )

    expect(bookedButton?.attributes('aria-disabled')).toBe('true')
    expect(bookedButton?.attributes('disabled')).toBeDefined()
  })
})
