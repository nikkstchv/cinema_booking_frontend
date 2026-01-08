import { describe, it, expect } from 'vitest'
import { decodeJWT, isTokenExpired } from '~/shared/lib/jwt'

describe('JWT utilities', () => {
  const createToken = (payload: Record<string, unknown>): string => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    const body = btoa(JSON.stringify(payload))
    const signature = 'signature'
    return `${header}.${body}.${signature}`
  }

  it('decodes valid token', () => {
    const token = createToken({ sub: 123, exp: Math.floor(Date.now() / 1000) + 3600 })
    const decoded = decodeJWT(token)
    expect(decoded).toEqual({ id: 123, exp: expect.any(Number) })
  })

  it('returns null for expired token', () => {
    const token = createToken({ sub: 123, exp: Math.floor(Date.now() / 1000) - 3600 })
    const decoded = decodeJWT(token)
    expect(decoded).toBeNull()
  })

  it('returns null for invalid format', () => {
    expect(decodeJWT('invalid')).toBeNull()
    expect(decodeJWT('part1.part2')).toBeNull()
  })

  it('returns null for missing sub', () => {
    const token = createToken({ exp: Math.floor(Date.now() / 1000) + 3600 })
    const decoded = decodeJWT(token)
    expect(decoded).toBeNull()
  })

  it('handles token without exp', () => {
    const token = createToken({ sub: 123 })
    const decoded = decodeJWT(token)
    expect(decoded).toEqual({ id: 123, exp: undefined })
  })

  it('isTokenExpired returns true for expired token', () => {
    const token = createToken({ sub: 123, exp: Math.floor(Date.now() / 1000) - 3600 })
    expect(isTokenExpired(token)).toBe(true)
  })

  it('isTokenExpired returns false for valid token', () => {
    const token = createToken({ sub: 123, exp: Math.floor(Date.now() / 1000) + 3600 })
    expect(isTokenExpired(token)).toBe(false)
  })

  it('isTokenExpired returns true for token without exp', () => {
    const token = createToken({ sub: 123 })
    expect(isTokenExpired(token)).toBe(true)
  })
})
