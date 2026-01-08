import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useMovies, useMovieSessions } from '~/features/movies/composables/useMovies'
import { moviesRepository } from '~/shared/api/repositories'
import type { Movie, MovieSession } from '~/shared/schemas'

vi.mock('~/shared/api/repositories', () => ({
  moviesRepository: {
    getAll: vi.fn(),
    getSessions: vi.fn()
  }
}))

describe('useMovies', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when fetch succeeds', () => {
    it('fetches movies from repository', async () => {
      const mockMovies: Movie[] = [
        {
          id: 1,
          title: 'Test Movie',
          description: 'Test Description',
          year: 2024,
          lengthMinutes: 120,
          posterImage: '/poster.jpg',
          rating: 8.5
        }
      ]
      vi.mocked(moviesRepository.getAll).mockResolvedValue(mockMovies)

      const TestComponent = defineComponent({
        setup() {
          return useMovies()
        },
        template: '<div></div>'
      })

      mount(TestComponent)

      await new Promise(resolve => setTimeout(resolve, 100))

      expect(moviesRepository.getAll).toHaveBeenCalled()
    })
  })

  describe('useMovieSessions', () => {
    describe('when fetch succeeds', () => {
      it('fetches movie sessions from repository', async () => {
        const mockSessions: MovieSession[] = [
          {
            id: 1,
            movieId: 1,
            cinemaId: 1,
            startTime: '2024-01-01T10:00:00Z'
          }
        ]
        vi.mocked(moviesRepository.getSessions).mockResolvedValue(mockSessions)

        const TestComponent = defineComponent({
          setup() {
            return useMovieSessions(1)
          },
          template: '<div></div>'
        })

        mount(TestComponent)

        await new Promise(resolve => setTimeout(resolve, 100))

        expect(moviesRepository.getSessions).toHaveBeenCalled()
      })
    })
  })
})
