import { z } from 'zod'
import { useApiClient, ApiError } from '../client'
import { MovieSchema, MovieSessionSchema, type Movie, type MovieSession } from '../../schemas'
import { logger } from '../../lib/logger'

export const moviesRepository = {
  async getAll(signal?: AbortSignal): Promise<Movie[]> {
    const client = useApiClient()
    const response = await client.get<unknown>('/movies', { signal })

    const result = z.array(MovieSchema).safeParse(response)
    if (!result.success) {
      logger.error('Movies response validation failed:', result.error)
      throw new ApiError('Invalid movies response', 500)
    }

    return result.data
  },

  async getSessions(movieId: number, signal?: AbortSignal): Promise<MovieSession[]> {
    const client = useApiClient()
    const response = await client.get<unknown>(`/movies/${movieId}/sessions`, { signal })

    const result = z.array(MovieSessionSchema).safeParse(response)
    if (!result.success) {
      console.error('Movie sessions response validation failed:', result.error)
      throw new ApiError('Invalid movie sessions response', 500)
    }

    return result.data
  }
}
