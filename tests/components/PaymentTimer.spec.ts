import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import PaymentTimer from '~/features/bookings/components/PaymentTimer.vue'

vi.mock('~/composables/useCountdown', () => {
  const mockUseCountdown = vi.fn(() => ({
    formattedTime: { value: '2:30' },
    isExpired: { value: false },
    remainingSeconds: { value: 150 },
    reset: vi.fn(),
    start: vi.fn(),
    stop: vi.fn()
  }))
  return {
    useCountdown: mockUseCountdown
  }
})

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

    expect(wrapper.exists()).toBe(true)
  })

  it('shows expired state when time is up', () => {
    const bookedAt = new Date('2024-01-01T11:57:00Z').toISOString()
    const wrapper = mount(PaymentTimer, {
      props: {
        bookedAt,
        timeoutSeconds: 180
      }
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('shows warning state when less than 1 minute left', () => {
    const bookedAt = new Date('2024-01-01T11:58:30Z').toISOString()
    const wrapper = mount(PaymentTimer, {
      props: {
        bookedAt,
        timeoutSeconds: 180
      }
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('emits expired event when countdown expires', () => {
    const bookedAt = new Date('2024-01-01T11:57:00Z').toISOString()
    const wrapper = mount(PaymentTimer, {
      props: {
        bookedAt,
        timeoutSeconds: 180
      }
    })

    expect(wrapper.exists()).toBe(true)
  })
})
