import { describe, it, expect, beforeEach, vi } from 'vitest'
import { settingsRepository } from '~/shared/api/repositories'
import { useApiClient, ApiError } from '~/shared/api/client'
import type { Settings } from '~/shared/schemas'

vi.mock('~/shared/api/client', () => ({
  useApiClient: vi.fn(),
  ApiError: class ApiError extends Error {
    constructor(message: string, public status: number) {
      super(message)
      this.name = 'ApiError'
    }
  }
}))

describe('settingsRepository', () => {
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

  describe('get', () => {
    it('fetches settings from API', async () => {
      const mockSettings: Settings = {
        bookingPaymentTimeSeconds: 180
      }
      mockClient.get.mockResolvedValue(mockSettings)

      const result = await settingsRepository.get()

      expect(mockClient.get).toHaveBeenCalledWith('/settings', expect.anything())
      expect(result).toEqual(mockSettings)
    })

    it('throws ApiError on invalid response', async () => {
      mockClient.get.mockResolvedValue({ invalid: 'data' })

      await expect(settingsRepository.get()).rejects.toThrow(ApiError)
    })
  })
})
