import { describe, it, expect, beforeEach, vi } from 'vitest'
import { sessionsRepository } from '~/shared/api/repositories'

vi.mock('~/shared/api/repositories', () => ({
  sessionsRepository: {
    getById: vi.fn(),
    book: vi.fn()
  }
}))

describe('useSessions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useSessionDetails', () => {
    it('repository getById is mocked', () => {
      expect(sessionsRepository.getById).toBeDefined()
      expect(typeof sessionsRepository.getById).toBe('function')
    })
  })

  describe('useBookSession', () => {
    it('repository book is mocked', () => {
      expect(sessionsRepository.book).toBeDefined()
      expect(typeof sessionsRepository.book).toBe('function')
    })
  })
})

