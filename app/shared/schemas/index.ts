import { z } from 'zod'

// Movie schema
export const MovieSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  year: z.number(),
  lengthMinutes: z.number(),
  posterImage: z.string(),
  rating: z.number().min(0).max(10)
})

// Cinema schema
export const CinemaSchema = z.object({
  id: z.number(),
  name: z.string(),
  address: z.string()
})

// Seat schema
export const SeatSchema = z.object({
  rowNumber: z.number().positive(),
  seatNumber: z.number().positive()
})

// Seats info schema
export const SeatsInfoSchema = z.object({
  rows: z.number().positive(),
  seatsPerRow: z.number().positive()
})

// Movie session schema
export const MovieSessionSchema = z.object({
  id: z.number(),
  movieId: z.number(),
  cinemaId: z.number(),
  startTime: z.string()
})

// Movie session with seats schema
export const MovieSessionDetailsSchema = MovieSessionSchema.extend({
  seats: SeatsInfoSchema,
  bookedSeats: z.array(SeatSchema)
})

// Booking schema
export const BookingSchema = z.object({
  id: z.string(),
  userId: z.number(),
  movieSessionId: z.number(),
  bookedAt: z.string(),
  seats: z.array(SeatSchema),
  isPaid: z.boolean()
})

// Settings schema
export const SettingsSchema = z.object({
  bookingPaymentTimeSeconds: z.number()
})

// Auth schemas
export const LoginRequestSchema = z.object({
  username: z.string().min(8, 'Минимум 8 символов'),
  password: z.string().min(8, 'Минимум 8 символов')
})

export const RegisterRequestSchema = z.object({
  username: z.string().min(8, 'Минимум 8 символов'),
  password: z
    .string()
    .min(8, 'Минимум 8 символов')
    .regex(/[A-Z]/, 'Минимум 1 заглавная буква')
    .regex(/\d/, 'Минимум 1 цифра'),
  passwordConfirmation: z.string()
}).refine(data => data.password === data.passwordConfirmation, {
  message: 'Пароли не совпадают',
  path: ['passwordConfirmation']
})

export const AuthResponseSchema = z.object({
  token: z.string()
})

// API Error schema
export const ApiErrorResponseSchema = z.object({
  message: z.string(),
  error: z.string().optional()
})

// Booking response schema
export const BookingResponseSchema = z.object({
  bookingId: z.string()
})

// Payment response schema
export const PaymentResponseSchema = z.object({
  message: z.string()
})

// Infer types from schemas
export type Movie = z.infer<typeof MovieSchema>
export type Cinema = z.infer<typeof CinemaSchema>
export type Seat = z.infer<typeof SeatSchema>
export type SeatsInfo = z.infer<typeof SeatsInfoSchema>
export type MovieSession = z.infer<typeof MovieSessionSchema>
export type MovieSessionDetails = z.infer<typeof MovieSessionDetailsSchema>
export type Booking = z.infer<typeof BookingSchema>
export type Settings = z.infer<typeof SettingsSchema>
export type LoginRequest = z.infer<typeof LoginRequestSchema>
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>
export type RegisterApiRequest = Omit<RegisterRequest, 'passwordConfirmation'>
export type AuthResponse = z.infer<typeof AuthResponseSchema>
export type BookingResponse = z.infer<typeof BookingResponseSchema>
export type PaymentResponse = z.infer<typeof PaymentResponseSchema>
