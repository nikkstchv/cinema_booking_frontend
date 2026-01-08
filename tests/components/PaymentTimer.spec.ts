import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import PaymentTimer from '~/features/bookings/components/PaymentTimer.vue'

const mockUseCountdown = vi.fn(() => ({
  formattedTime: { value: '2:30' },
  isExpired: { value: false },
  remainingSeconds: { value: 150 },
  reset: vi.fn()
}))

vi.mock('~/composables/useCountdown', () => ({
  useCountdown: mockUseCountdown
}))

describe('PaymentTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'))
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('renders countdown timer', () => {
    const bookedAt = new Date('2024-01-01T11:57:30Z').toISOString()
    const wrapper = mount(PaymentTimer, {
      props: {
        bookedAt,
        timeoutSeconds: 180
      }
    })

    expect(wrapper.text()).toContain('Осталось:')
  })

  it('shows expired state when time is up', () => {
    mockUseCountdown.mockReturnValueOnce({
      formattedTime: { value: '0:00' },
      isExpired: { value: true },
      remainingSeconds: { value: 0 },
      reset: vi.fn()
    })

    const bookedAt = new Date('2024-01-01T11:57:00Z').toISOString()
    const wrapper = mount(PaymentTimer, {
      props: {
        bookedAt,
        timeoutSeconds: 180
      }
    })

    expect(wrapper.text()).toContain('Время истекло')
  })

  it('shows warning state when less than 1 minute left', () => {
    mockUseCountdown.mockReturnValueOnce({
      formattedTime: { value: '0:30' },
      isExpired: { value: false },
      remainingSeconds: { value: 30 },
      reset: vi.fn()
    })

    const bookedAt = new Date('2024-01-01T11:58:30Z').toISOString()
    const wrapper = mount(PaymentTimer, {
      props: {
        bookedAt,
        timeoutSeconds: 180
      }
    })

    expect(wrapper.classes()).toContain('text-red-600')
  })

  it('emits expired event when countdown expires', () => {
    mockUseCountdown.mockReturnValueOnce({
      formattedTime: { value: '0:00' },
      isExpired: { value: true },
      remainingSeconds: { value: 0 },
      reset: vi.fn()
    })

    const bookedAt = new Date('2024-01-01T11:57:00Z').toISOString()
    const wrapper = mount(PaymentTimer, {
      props: {
        bookedAt,
        timeoutSeconds: 180
      }
    })

    expect(wrapper.emitted('expired')).toBeTruthy()
  })
})
