import { describe, it, expect } from 'vitest'
import {
  MovieSchema,
  CinemaSchema,
  SeatSchema,
  BookingSchema,
  LoginRequestSchema,
  RegisterRequestSchema
} from '~/shared/schemas'

describe('MovieSchema', () => {
  it('validates correct movie data', () => {
    const movie = {
      id: 1,
      title: 'Test Movie',
      description: 'A test movie description',
      year: 2024,
      lengthMinutes: 120,
      posterImage: '/poster.jpg',
      rating: 8.5
    }

    expect(MovieSchema.safeParse(movie).success).toBe(true)
  })

  it('rejects invalid rating', () => {
    const movie = {
      id: 1,
      title: 'Test',
      description: 'Test',
      year: 2024,
      lengthMinutes: 120,
      posterImage: '/poster.jpg',
      rating: 15 // Invalid: max is 10
    }

    expect(MovieSchema.safeParse(movie).success).toBe(false)
  })

  it('rejects missing fields', () => {
    const movie = {
      id: 1,
      title: 'Test'
      // Missing required fields
    }

    expect(MovieSchema.safeParse(movie).success).toBe(false)
  })
})

describe('CinemaSchema', () => {
  it('validates correct cinema data', () => {
    const cinema = {
      id: 1,
      name: 'Test Cinema',
      address: '123 Main St'
    }

    expect(CinemaSchema.safeParse(cinema).success).toBe(true)
  })
})

describe('SeatSchema', () => {
  it('validates correct seat data', () => {
    const seat = { rowNumber: 1, seatNumber: 5 }
    expect(SeatSchema.safeParse(seat).success).toBe(true)
  })

  it('rejects non-positive numbers', () => {
    expect(SeatSchema.safeParse({ rowNumber: 0, seatNumber: 1 }).success).toBe(false)
    expect(SeatSchema.safeParse({ rowNumber: 1, seatNumber: -1 }).success).toBe(false)
  })
})

describe('BookingSchema', () => {
  it('validates correct booking data', () => {
    const booking = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: 1,
      movieSessionId: 10,
      bookedAt: '2024-01-15T10:30:00.000Z',
      seats: [
        { rowNumber: 1, seatNumber: 1 },
        { rowNumber: 1, seatNumber: 2 }
      ],
      isPaid: false
    }

    expect(BookingSchema.safeParse(booking).success).toBe(true)
  })
})

describe('LoginRequestSchema', () => {
  it('validates correct credentials', () => {
    const creds = {
      username: 'testuser1',
      password: 'password123'
    }

    expect(LoginRequestSchema.safeParse(creds).success).toBe(true)
  })

  it('rejects short username', () => {
    const creds = {
      username: 'test', // Less than 8 chars
      password: 'password123'
    }

    const result = LoginRequestSchema.safeParse(creds)
    expect(result.success).toBe(false)
  })

  it('rejects short password', () => {
    const creds = {
      username: 'testuser1',
      password: 'pass' // Less than 8 chars
    }

    const result = LoginRequestSchema.safeParse(creds)
    expect(result.success).toBe(false)
  })
})

describe('RegisterRequestSchema', () => {
  it('validates correct registration data', () => {
    const data = {
      username: 'newuser123',
      password: 'Password1',
      passwordConfirmation: 'Password1'
    }

    expect(RegisterRequestSchema.safeParse(data).success).toBe(true)
  })

  it('rejects password without uppercase', () => {
    const data = {
      username: 'newuser123',
      password: 'password1', // No uppercase
      passwordConfirmation: 'password1'
    }

    expect(RegisterRequestSchema.safeParse(data).success).toBe(false)
  })

  it('rejects password without number', () => {
    const data = {
      username: 'newuser123',
      password: 'Password', // No number
      passwordConfirmation: 'Password'
    }

    expect(RegisterRequestSchema.safeParse(data).success).toBe(false)
  })

  it('rejects mismatched passwords', () => {
    const data = {
      username: 'newuser123',
      password: 'Password1',
      passwordConfirmation: 'Password2'
    }

    expect(RegisterRequestSchema.safeParse(data).success).toBe(false)
  })
})
