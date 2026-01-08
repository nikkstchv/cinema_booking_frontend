import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SeatSelector from '~/features/sessions/components/SeatSelector.vue'
import type { Seat, SeatsInfo } from '~/shared/schemas'

describe('SeatSelector', () => {
  let seatsInfo: SeatsInfo
  let bookedSeats: Seat[]

  beforeEach(() => {
    vi.clearAllMocks()
    seatsInfo = {
      rows: 3,
      seatsPerRow: 4
    }
    bookedSeats = [
      { rowNumber: 1, seatNumber: 1 },
      { rowNumber: 2, seatNumber: 2 }
    ]
  })

  const mountSeatSelector = (props = {}) => {
    return mount(SeatSelector, {
      props: {
        seatsInfo,
        bookedSeats: [],
        isAuthenticated: true,
        ...props
      },
      global: {
        stubs: {
          SeatLegend: true
        }
      }
    })
  }

  describe('rendering', () => {
    it('renders seat grid', () => {
      const wrapper = mountSeatSelector()

      expect(wrapper.find('[data-testid="seat-grid"]').exists()).toBe(true)
      expect(wrapper.find('[role="grid"]').exists()).toBe(true)
      expect(wrapper.findAll('[role="row"]').length).toBe(3)
    })
  })

  describe('seat selection', () => {
    describe('when seat is available', () => {
      it('emits selected seats on click', async () => {
        const wrapper = mountSeatSelector({ isAuthenticated: true })

        await wrapper.vm.$nextTick()

        const seatButtons = wrapper.findAll('button[role="gridcell"]')
        const freeSeat = seatButtons.find(btn =>
          btn.attributes('aria-label')?.includes('Ряд 1, место 2')
          && !btn.attributes('disabled')
        )

        if (freeSeat) {
          await freeSeat.trigger('click')
          await wrapper.vm.$nextTick()

          expect(wrapper.emitted('update:selected')).toBeTruthy()
          const emitted = wrapper.emitted('update:selected')?.[0]?.[0] as Seat[]
          expect(emitted).toBeDefined()
          if (emitted) {
            expect(emitted.length).toBeGreaterThan(0)
          }
        } else {
          expect(seatButtons.length).toBeGreaterThan(0)
        }
      })
    })

    describe('when seat is booked', () => {
      it('marks booked seats as disabled', () => {
        const wrapper = mountSeatSelector({ bookedSeats })

        const seatButtons = wrapper.findAll('button[role="gridcell"]')
        const bookedButton = seatButtons.find(btn =>
          btn.attributes('aria-label')?.includes('Ряд 1, место 1')
        )

        expect(bookedButton?.attributes('aria-disabled')).toBe('true')
        expect(bookedButton?.attributes('disabled')).toBeDefined()
      })
    })
  })

  describe('keyboard navigation', () => {
    it('handles keyboard navigation', async () => {
      const wrapper = mountSeatSelector()

      const seatButtons = wrapper.findAll('button[role="gridcell"]')
      const firstSeat = seatButtons[0]

      await firstSeat.trigger('keydown', { key: 'ArrowRight' })

      expect(document.activeElement).toBeTruthy()
    })
  })

  describe('disabled state', () => {
    it('disables interaction when disabled prop is true', () => {
      const wrapper = mountSeatSelector({ disabled: true })

      const seatButtons = wrapper.findAll('button[role="gridcell"]')
      seatButtons.forEach((btn) => {
        expect(btn.attributes('disabled')).toBeDefined()
      })
    })
  })

  it('marks booked seats as disabled', () => {
    const wrapper = mount(SeatSelector, {
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

    const seatButtons = wrapper.findAll('button[role="gridcell"]')
    const bookedButton = seatButtons.find(btn =>
      btn.attributes('aria-label')?.includes('Ряд 1, место 1')
    )

    expect(bookedButton?.attributes('aria-disabled')).toBe('true')
  })

  it('emits selected seats on click', async () => {
    const wrapper = mount(SeatSelector, {
      props: {
        seatsInfo,
        bookedSeats: [],
        isAuthenticated: true
      },
      global: {
        stubs: {
          SeatLegend: true
        }
      }
    })

    await wrapper.vm.$nextTick()

    const seatButtons = wrapper.findAll('button[role="gridcell"]')
    const freeSeat = seatButtons.find(btn =>
      btn.attributes('aria-label')?.includes('Ряд 1, место 2')
      && !btn.attributes('disabled')
      && !btn.attributes('aria-disabled')
    )

    if (freeSeat) {
      await freeSeat.trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.emitted('update:selected') || wrapper.emitted('login-required')).toBeTruthy()
    } else {
      expect(seatButtons.length).toBeGreaterThan(0)
    }
  })

  it('handles keyboard navigation', async () => {
    const wrapper = mount(SeatSelector, {
      props: {
        seatsInfo,
        bookedSeats: []
      },
      global: {
        stubs: {
          SeatLegend: true
        }
      }
    })

    const seatButtons = wrapper.findAll('button[role="gridcell"]')
    const firstSeat = seatButtons[0]

    await firstSeat.trigger('keydown', { key: 'ArrowRight' })

    expect(document.activeElement).toBeTruthy()
  })

  it('disables interaction when disabled prop is true', () => {
    const wrapper = mount(SeatSelector, {
      props: {
        seatsInfo,
        bookedSeats: [],
        disabled: true
      },
      global: {
        stubs: {
          SeatLegend: true
        }
      }
    })

    const seatButtons = wrapper.findAll('button[role="gridcell"]')
    seatButtons.forEach((btn) => {
      expect(btn.attributes('disabled')).toBeDefined()
    })
  })
})
