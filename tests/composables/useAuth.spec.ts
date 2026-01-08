import { describe, it, expect, beforeEach, vi } from 'vitest'
import { authRepository } from '~/shared/api/repositories'

vi.mock('~/shared/api/repositories', () => ({
  authRepository: {
    login: vi.fn(),
    register: vi.fn()
  }
}))

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('repository login is mocked', () => {
    expect(authRepository.login).toBeDefined()
    expect(typeof authRepository.login).toBe('function')
  })

  it('repository register is mocked', () => {
    expect(authRepository.register).toBeDefined()
    expect(typeof authRepository.register).toBe('function')
  })
})

