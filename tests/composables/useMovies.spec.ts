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

vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    computed: (fn: () => unknown) => ({ value: fn() }),
    toValue: (val: unknown) => val
  }
})

const waitForLoading = async (isLoading: { value: boolean }, timeout = 5000) => {
  const startTime = Date.now()
  while (isLoading.value && Date.now() - startTime < timeout) {
    await new Promise(resolve => setTimeout(resolve, 10))
  }
}

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

      const result = useMovies()

      await waitForLoading(result.isLoading)

      expect(moviesRepository.getAll).toHaveBeenCalledTimes(1)
      expect(result.isLoading.value).toBe(false)
      expect(result.data.value).toEqual(mockMovies)
    })

    it('sorts movies by rating descending', async () => {
      const mockMovies: Movie[] = [
        { id: 1, title: 'Movie 1', description: '', year: 2024, lengthMinutes: 120, posterImage: '', rating: 7.0 },
        { id: 2, title: 'Movie 2', description: '', year: 2024, lengthMinutes: 120, posterImage: '', rating: 9.0 },
        { id: 3, title: 'Movie 3', description: '', year: 2024, lengthMinutes: 120, posterImage: '', rating: 8.0 }
      ]
      vi.mocked(moviesRepository.getAll).mockResolvedValue(mockMovies)

      const result = useMovies()

      await waitForLoading(result.isLoading)

      expect(result.data.value).toBeDefined()
      if (result.data.value) {
        expect(result.data.value[0].rating).toBe(9.0)
        expect(result.data.value[1].rating).toBe(8.0)
        expect(result.data.value[2].rating).toBe(7.0)
      }
    })

    it('handles fetch error', async () => {
      const error = new Error('Failed to fetch movies')
      vi.mocked(moviesRepository.getAll).mockRejectedValue(error)

      const result = useMovies()

      await waitForLoading(result.isLoading)

      expect(result.error.value).toBeDefined()
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

      const result = useMovieSessions(1)

      await waitForLoading(result.isLoading)

      expect(moviesRepository.getSessions).toHaveBeenCalledWith(1, expect.anything())
      expect(result.isLoading.value).toBe(false)
      expect(result.data.value).toEqual(mockSessions)
    })

    it('does not fetch when movieId is 0', () => {
      const result = useMovieSessions(0)

      expect(result.enabled.value).toBe(false)
      expect(moviesRepository.getSessions).not.toHaveBeenCalled()
    })

    it('handles fetch error', async () => {
      const error = new Error('Failed to fetch sessions')
      vi.mocked(moviesRepository.getSessions).mockRejectedValue(error)

      const result = useMovieSessions(1)

      await waitForLoading(result.isLoading)

      expect(result.error.value).toBeDefined()
    })
  })
})
