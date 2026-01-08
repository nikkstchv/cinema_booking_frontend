import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock Vue lifecycle hooks
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    onUnmounted: vi.fn()
  }
})

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('starts with initial seconds', async () => {
    // Dynamic import to get fresh module
    const { useCountdown } = await import('~/composables/useCountdown')

    const { remainingSeconds, formattedTime, isExpired } = useCountdown(180)

    expect(remainingSeconds.value).toBe(180)
    expect(formattedTime.value).toBe('3:00')
    expect(isExpired.value).toBe(false)
  })

  it('decrements every second', async () => {
    const { useCountdown } = await import('~/composables/useCountdown')

    const { remainingSeconds } = useCountdown(10)

    expect(remainingSeconds.value).toBe(10)

    vi.advanceTimersByTime(1000)
    expect(remainingSeconds.value).toBe(9)

    vi.advanceTimersByTime(3000)
    expect(remainingSeconds.value).toBe(6)
  })

  it('calls onExpire callback when reaching zero', async () => {
    const { useCountdown } = await import('~/composables/useCountdown')

    const onExpire = vi.fn()
    const { isExpired } = useCountdown(2, onExpire)

    expect(onExpire).not.toHaveBeenCalled()

    vi.advanceTimersByTime(2000)

    expect(onExpire).toHaveBeenCalledTimes(1)
    expect(isExpired.value).toBe(true)
  })

  it('formats time correctly', async () => {
    const { useCountdown } = await import('~/composables/useCountdown')

    const { formattedTime } = useCountdown(125)

    expect(formattedTime.value).toBe('2:05')
  })

  it('stops at zero', async () => {
    const { useCountdown } = await import('~/composables/useCountdown')

    const { remainingSeconds } = useCountdown(1)

    vi.advanceTimersByTime(5000) // Advance more than initial

    expect(remainingSeconds.value).toBe(0)
  })
})
