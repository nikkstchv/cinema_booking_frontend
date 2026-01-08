import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import BookingConfirmation from '~/features/sessions/components/BookingConfirmation.vue'
import type { Seat } from '~/shared/schemas'

vi.mock('~/shared/composables/useFocusTrap', () => ({
  useFocusTrap: vi.fn()
}))

describe('BookingConfirmation', () => {
  const mockSeats: Seat[] = [
    { rowNumber: 1, seatNumber: 1 },
    { rowNumber: 1, seatNumber: 2 }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders booking details', () => {
    const wrapper = mount(BookingConfirmation, {
      props: {
        seats: mockSeats,
        movieTitle: 'Test Movie',
        cinemaName: 'Test Cinema',
        sessionTime: '15:30'
      }
    })

    expect(wrapper.text()).toContain('Test Movie')
    expect(wrapper.text()).toContain('Test Cinema')
    expect(wrapper.text()).toContain('15:30')
  })

  it('displays selected seats', () => {
    const wrapper = mount(BookingConfirmation, {
      props: {
        seats: mockSeats,
        movieTitle: 'Test Movie',
        cinemaName: 'Test Cinema',
        sessionTime: '15:30'
      }
    })

    expect(wrapper.text()).toContain('Выбранные места (2)')
    expect(wrapper.text()).toContain('Ряд 1, место 1')
    expect(wrapper.text()).toContain('Ряд 1, место 2')
  })

  it('emits confirm event on confirm button click', async () => {
    const wrapper = mount(BookingConfirmation, {
      props: {
        seats: mockSeats,
        movieTitle: 'Test Movie',
        cinemaName: 'Test Cinema',
        sessionTime: '15:30'
      }
    })

    const confirmButton = wrapper.findAll('button').find(btn => btn.text().includes('Забронировать'))
    await confirmButton?.trigger('click')

    expect(wrapper.emitted('confirm')).toBeTruthy()
  })

  it('emits cancel event on cancel button click', async () => {
    const wrapper = mount(BookingConfirmation, {
      props: {
        seats: mockSeats,
        movieTitle: 'Test Movie',
        cinemaName: 'Test Cinema',
        sessionTime: '15:30'
      }
    })

    const cancelButton = wrapper.findAll('button').find(btn => btn.text().includes('Отмена'))
    await cancelButton?.trigger('click')

    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('shows loading state', () => {
    const wrapper = mount(BookingConfirmation, {
      props: {
        seats: mockSeats,
        movieTitle: 'Test Movie',
        cinemaName: 'Test Cinema',
        sessionTime: '15:30',
        loading: true
      }
    })

    const confirmButton = wrapper.findAll('button').find(btn => btn.text().includes('Забронировать'))
    expect(confirmButton?.attributes('loading')).toBeDefined()
  })
})
