import { z } from 'zod'
import { useApiClient, ApiError } from '../client'
import { CinemaSchema, MovieSessionSchema, type Cinema, type MovieSession } from '../../schemas'
import { logger } from '../../lib/logger'

export const cinemasRepository = {
  async getAll(signal?: AbortSignal): Promise<Cinema[]> {
    const client = useApiClient()
    const response = await client.get('/cinemas', { signal })

    const result = z.array(CinemaSchema).safeParse(response)
    if (!result.success) {
      const errorDetails = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      logger.error('Cinemas response validation failed:', result.error)
      throw new ApiError(`Неверный формат ответа сервера при получении кинотеатров: ${errorDetails}`, 500)
    }

    return result.data
  },

  async getSessions(cinemaId: number, signal?: AbortSignal): Promise<MovieSession[]> {
    const client = useApiClient()
    const response = await client.get(`/cinemas/${cinemaId}/sessions`, { signal })

    const result = z.array(MovieSessionSchema).safeParse(response)
    if (!result.success) {
      const errorDetails = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      logger.error('Cinema sessions response validation failed:', result.error)
      throw new ApiError(`Неверный формат ответа сервера при получении сеансов кинотеатра: ${errorDetails}`, 500)
    }

    return result.data
  }
}
