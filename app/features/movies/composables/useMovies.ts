import { useQuery } from '@tanstack/vue-query'
import { moviesRepository } from '~/shared/api/repositories'
import { queryKeys } from '~/shared/lib/query-keys'

/**
 * Get all movies
 */
export function useMovies() {
  return useQuery({
    queryKey: queryKeys.movies.all,
    queryFn: ({ signal }) => moviesRepository.getAll(signal),
    select: movies => movies.sort((a, b) => b.rating - a.rating),
    staleTime: 1000 * 60 * 5,
    placeholderData: previousData => previousData
  })
}

/**
 * Get movie sessions
 */
export function useMovieSessions(movieId: number | Ref<number>) {
  const id = computed(() => toValue(movieId))

  return useQuery({
    queryKey: computed(() => queryKeys.movies.sessions(id.value)),
    queryFn: ({ signal }) => moviesRepository.getSessions(id.value, signal),
    enabled: computed(() => id.value > 0),
    staleTime: 1000 * 30,
    placeholderData: previousData => previousData
  })
}
