import { describe, it, expect, beforeEach, vi } from 'vitest'
import { moviesRepository } from '~/shared/api/repositories'
import { useApiClient, ApiError } from '~/shared/api/client'
import type { Movie, MovieSession } from '~/shared/schemas'

vi.mock('~/shared/api/client', () => ({
  useApiClient: vi.fn(),
  ApiError: class ApiError extends Error {
    constructor(message: string, public status: number) {
      super(message)
      this.name = 'ApiError'
    }
  }
}))

describe('moviesRepository', () => {
  let mockClient: {
    get: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockClient = {
      get: vi.fn()
    }
    vi.mocked(useApiClient).mockReturnValue(mockClient as ReturnType<typeof useApiClient>)
  })

  describe('getAll', () => {
    it('fetches movies from API', async () => {
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
      mockClient.get.mockResolvedValue(mockMovies)

      const result = await moviesRepository.getAll()

      expect(mockClient.get).toHaveBeenCalledWith('/movies', expect.anything())
      expect(result).toEqual(mockMovies)
    })

    it('throws ApiError on invalid response', async () => {
      mockClient.get.mockResolvedValue([{ invalid: 'data' }])

      await expect(moviesRepository.getAll()).rejects.toThrow(ApiError)
    })
  })

  describe('getSessions', () => {
    it('fetches movie sessions from API', async () => {
      const movieId = 1
      const mockSessions: MovieSession[] = [
        {
          id: 1,
          movieId,
          cinemaId: 1,
          startTime: '2024-01-01T10:00:00Z'
        }
      ]
      mockClient.get.mockResolvedValue(mockSessions)

      const result = await moviesRepository.getSessions(movieId)

      expect(mockClient.get).toHaveBeenCalledWith(`/movies/${movieId}/sessions`, expect.anything())
      expect(result).toEqual(mockSessions)
    })

    it('throws ApiError on invalid response', async () => {
      const movieId = 1
      mockClient.get.mockResolvedValue([{ invalid: 'data' }])

      await expect(moviesRepository.getSessions(movieId)).rejects.toThrow(ApiError)
    })
  })
})
