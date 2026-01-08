import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useSessionDetails } from '~/features/sessions/composables/useSessions'
import { sessionsRepository } from '~/shared/api/repositories'
import type { MovieSessionDetails } from '~/shared/schemas'

vi.mock('~/shared/api/repositories', () => ({
  sessionsRepository: {
    getById: vi.fn(),
    book: vi.fn()
  }
}))

vi.mock('~/composables/useErrorHandler', () => ({
  useErrorHandler: vi.fn(() => ({
    handleError: vi.fn()
  }))
}))

describe('useSessions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useSessionDetails', () => {
    it('fetches session details from repository', async () => {
      const mockSession: MovieSessionDetails = {
        id: 1,
        movieId: 1,
        cinemaId: 1,
        startTime: '2024-01-01T10:00:00Z',
        seats: { rows: 5, seatsPerRow: 10 },
        bookedSeats: []
      }
      vi.mocked(sessionsRepository.getById).mockResolvedValue(mockSession)

      const TestComponent = defineComponent({
        setup() {
          return useSessionDetails(1)
        },
        template: '<div></div>'
      })

      mount(TestComponent)

      await new Promise(resolve => setTimeout(resolve, 100))

      expect(sessionsRepository.getById).toHaveBeenCalledWith(1, expect.anything())
    })
  })
})
