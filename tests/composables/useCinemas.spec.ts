import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useCinemas, useCinemaSessions } from '~/features/cinemas/composables/useCinemas'
import { cinemasRepository } from '~/shared/api/repositories'
import type { Cinema, MovieSession } from '~/shared/schemas'

vi.mock('~/shared/api/repositories', () => ({
  cinemasRepository: {
    getAll: vi.fn(),
    getSessions: vi.fn()
  }
}))

describe('useCinemas', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useCinemas', () => {
    it('fetches cinemas from repository', async () => {
      const mockCinemas: Cinema[] = [
        {
          id: 1,
          name: 'Test Cinema',
          address: 'Test Address'
        }
      ]
      vi.mocked(cinemasRepository.getAll).mockResolvedValue(mockCinemas)

      const TestComponent = defineComponent({
        setup() {
          const result = useCinemas()
          return { result }
        },
        template: '<div></div>'
      })

      mount(TestComponent)

      await new Promise(resolve => setTimeout(resolve, 100))

      expect(cinemasRepository.getAll).toHaveBeenCalled()
    })
  })

  describe('useCinemaSessions', () => {
    it('fetches cinema sessions from repository', async () => {
      const mockSessions: MovieSession[] = [
        {
          id: 1,
          movieId: 1,
          cinemaId: 1,
          startTime: '2024-01-01T10:00:00Z'
        }
      ]
      vi.mocked(cinemasRepository.getSessions).mockResolvedValue(mockSessions)

      const TestComponent = defineComponent({
        setup() {
          const result = useCinemaSessions(1)
          return { result }
        },
        template: '<div></div>'
      })

      mount(TestComponent)

      await new Promise(resolve => setTimeout(resolve, 100))

      expect(cinemasRepository.getSessions).toHaveBeenCalledWith(1, expect.anything())
    })
  })
})
