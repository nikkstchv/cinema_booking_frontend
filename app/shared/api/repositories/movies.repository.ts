import { z } from 'zod'
import { useApiClient, ApiError } from '../client'
import { MovieSchema, MovieSessionSchema, type Movie, type MovieSession } from '../../schemas'
import { logger } from '../../lib/logger'

export const moviesRepository = {
  async getAll(signal?: AbortSignal): Promise<Movie[]> {
    const client = useApiClient()
    const response = await client.get('/movies', { signal })

    const result = z.array(MovieSchema).safeParse(response)
    if (!result.success) {
      const errorDetails = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      logger.error('Movies response validation failed:', result.error)
      throw new ApiError(`Неверный формат ответа сервера при получении фильмов: ${errorDetails}`, 500)
    }

    return result.data
  },

  async getSessions(movieId: number, signal?: AbortSignal): Promise<MovieSession[]> {
    const client = useApiClient()
    const response = await client.get(`/movies/${movieId}/sessions`, { signal })

    const result = z.array(MovieSessionSchema).safeParse(response)
    if (!result.success) {
      const errorDetails = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      logger.error('Movie sessions response validation failed:', result.error)
      throw new ApiError(`Неверный формат ответа сервера при получении сеансов: ${errorDetails}`, 500)
    }

    return result.data
  }
}
