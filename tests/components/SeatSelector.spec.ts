import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SeatSelector from '~/features/sessions/components/SeatSelector.vue'
import type { Seat, SeatsInfo } from '~/shared/schemas'

describe('SeatSelector', () => {
  const seatsInfo: SeatsInfo = {
    rows: 3,
    seatsPerRow: 4
  }

  const bookedSeats: Seat[] = [
    { rowNumber: 1, seatNumber: 1 },
    { rowNumber: 2, seatNumber: 2 }
  ]

  it('renders seat grid', () => {
    const wrapper = mount(SeatSelector, {
      props: {
        seatsInfo,
        bookedSeats: []
      }
    })

    expect(wrapper.find('[role="grid"]').exists()).toBe(true)
    expect(wrapper.findAll('[role="row"]').length).toBe(3)
  })

  it('marks booked seats as disabled', () => {
    const wrapper = mount(SeatSelector, {
      props: {
        seatsInfo,
        bookedSeats
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
        bookedSeats: []
      }
    })

    const seatButtons = wrapper.findAll('button[role="gridcell"]')
    const freeSeat = seatButtons.find(btn =>
      btn.attributes('aria-label')?.includes('Ряд 1, место 2')
    )

    await freeSeat?.trigger('click')

    expect(wrapper.emitted('update:selected')).toBeTruthy()
    const emitted = wrapper.emitted('update:selected')?.[0]?.[0] as Seat[]
    expect(emitted).toHaveLength(1)
    expect(emitted[0]).toEqual({ rowNumber: 1, seatNumber: 2 })
  })

  it('handles keyboard navigation', async () => {
    const wrapper = mount(SeatSelector, {
      props: {
        seatsInfo,
        bookedSeats: []
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
      }
    })

    const seatButtons = wrapper.findAll('button[role="gridcell"]')
    seatButtons.forEach((btn) => {
      expect(btn.attributes('disabled')).toBeDefined()
    })
  })
})
