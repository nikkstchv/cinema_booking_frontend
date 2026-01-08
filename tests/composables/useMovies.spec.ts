import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useMovies, useMovieSessions } from '~/features/movies/composables/useMovies'
import { moviesRepository } from '~/shared/api/repositories'
import type { Movie, MovieSession } from '~/shared/schemas'

vi.mock('~/shared/api/repositories', () => ({
  moviesRepository: {
    getAll: vi.fn(),
    getSessions: vi.fn()
  }
}))

vi.mock('#app', () => ({
  computed: vi.fn((fn: () => unknown) => ({ value: fn() })),
  toValue: vi.fn((val: unknown) => val)
}))

describe('useMovies', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useMovies', () => {
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

      useMovies()

      await new Promise(resolve => setTimeout(resolve, 0))

      expect(moviesRepository.getAll).toHaveBeenCalled()
    })

    it('sorts movies by rating descending', async () => {
      const mockMovies: Movie[] = [
        { id: 1, title: 'Movie 1', description: '', year: 2024, lengthMinutes: 120, posterImage: '', rating: 7.0 },
        { id: 2, title: 'Movie 2', description: '', year: 2024, lengthMinutes: 120, posterImage: '', rating: 9.0 },
        { id: 3, title: 'Movie 3', description: '', year: 2024, lengthMinutes: 120, posterImage: '', rating: 8.0 }
      ]
      vi.mocked(moviesRepository.getAll).mockResolvedValue(mockMovies)

      const result = useMovies()

      await new Promise(resolve => setTimeout(resolve, 0))

      expect(result.data.value?.[0].rating).toBe(9.0)
      expect(result.data.value?.[1].rating).toBe(8.0)
      expect(result.data.value?.[2].rating).toBe(7.0)
    })
  })

  describe('useMovieSessions', () => {
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

      useMovieSessions(1)

      await new Promise(resolve => setTimeout(resolve, 0))

      expect(moviesRepository.getSessions).toHaveBeenCalledWith(1, expect.anything())
    })

    it('does not fetch when movieId is 0', () => {
      const { enabled } = useMovieSessions(0)

      expect(enabled.value).toBe(false)
    })
  })
})
