import { describe, it, expect } from 'vitest'
import {
  formatDuration,
  formatDate,
  formatTime,
  formatDateTime,
  getFullPosterUrl
} from '~/shared/lib/formatters'

describe('formatDuration', () => {
  it('formats hours and minutes correctly', () => {
    expect(formatDuration(142)).toBe('2:22')
    expect(formatDuration(60)).toBe('1:00')
    expect(formatDuration(90)).toBe('1:30')
  })

  it('handles single digit minutes', () => {
    expect(formatDuration(65)).toBe('1:05')
    expect(formatDuration(121)).toBe('2:01')
  })

  it('handles zero hours', () => {
    expect(formatDuration(30)).toBe('0:30')
    expect(formatDuration(5)).toBe('0:05')
  })
})

describe('formatDate', () => {
  it('formats date in Russian locale', () => {
    const date = new Date('2024-07-24T15:30:00')
    expect(formatDate(date)).toBe('24.07')
  })

  it('accepts string dates', () => {
    expect(formatDate('2024-01-15T10:00:00')).toBe('15.01')
  })
})

describe('formatTime', () => {
  it('formats time correctly', () => {
    const date = new Date('2024-07-24T15:30:00')
    expect(formatTime(date)).toBe('15:30')
  })

  it('handles morning times', () => {
    expect(formatTime('2024-01-01T09:05:00')).toBe('09:05')
  })
})

describe('formatDateTime', () => {
  it('combines date and time', () => {
    const date = new Date('2024-07-24T15:30:00')
    expect(formatDateTime(date)).toBe('24.07 15:30')
  })
})

describe('getFullPosterUrl', () => {
  const baseUrl = 'http://localhost:3022'

  it('prepends base URL to relative path', () => {
    expect(getFullPosterUrl('/static/images/poster.jpg', baseUrl))
      .toBe('http://localhost:3022/static/images/poster.jpg')
  })

  it('returns absolute URLs unchanged', () => {
    const absoluteUrl = 'https://example.com/poster.jpg'
    expect(getFullPosterUrl(absoluteUrl, baseUrl)).toBe(absoluteUrl)
  })

  it('handles empty path', () => {
    expect(getFullPosterUrl('', baseUrl)).toBe('')
  })
})
