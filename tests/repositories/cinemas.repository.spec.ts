import { describe, it, expect, beforeEach, vi } from 'vitest'
import { cinemasRepository } from '~/shared/api/repositories'
import { useApiClient, ApiError } from '~/shared/api/client'
import type { Cinema, MovieSession } from '~/shared/schemas'

vi.mock('~/shared/api/client', () => ({
  useApiClient: vi.fn(),
  ApiError: class ApiError extends Error {
    constructor(message: string, public status: number) {
      super(message)
      this.name = 'ApiError'
    }
  }
}))

describe('cinemasRepository', () => {
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
    it('fetches cinemas from API', async () => {
      const mockCinemas: Cinema[] = [
        {
          id: 1,
          name: 'Test Cinema',
          address: 'Test Address'
        }
      ]
      mockClient.get.mockResolvedValue(mockCinemas)

      const result = await cinemasRepository.getAll()

      expect(mockClient.get).toHaveBeenCalledWith('/cinemas', expect.anything())
      expect(result).toEqual(mockCinemas)
    })

    it('throws ApiError on invalid response', async () => {
      mockClient.get.mockResolvedValue([{ invalid: 'data' }])

      await expect(cinemasRepository.getAll()).rejects.toThrow(ApiError)
    })
  })

  describe('getSessions', () => {
    it('fetches cinema sessions from API', async () => {
      const cinemaId = 1
      const mockSessions: MovieSession[] = [
        {
          id: 1,
          movieId: 1,
          cinemaId,
          startTime: '2024-01-01T10:00:00Z'
        }
      ]
      mockClient.get.mockResolvedValue(mockSessions)

      const result = await cinemasRepository.getSessions(cinemaId)

      expect(mockClient.get).toHaveBeenCalledWith(`/cinemas/${cinemaId}/sessions`, expect.anything())
      expect(result).toEqual(mockSessions)
    })

    it('throws ApiError on invalid response', async () => {
      const cinemaId = 1
      mockClient.get.mockResolvedValue([{ invalid: 'data' }])

      await expect(cinemasRepository.getSessions(cinemaId)).rejects.toThrow(ApiError)
    })
  })
})
