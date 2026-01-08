import { useQuery } from '@tanstack/vue-query'
import { cinemasRepository } from '~/shared/api/repositories'
import { queryKeys } from '~/shared/lib/query-keys'

/**
 * Get all cinemas
 */
export function useCinemas() {
  return useQuery({
    queryKey: queryKeys.cinemas.all,
    queryFn: ({ signal }) => cinemasRepository.getAll(signal),
    staleTime: 1000 * 60 * 10,
    keepPreviousData: true
  })
}

/**
 * Get cinema sessions
 */
export function useCinemaSessions(cinemaId: number | Ref<number>) {
  const id = computed(() => toValue(cinemaId))

  return useQuery({
    queryKey: computed(() => queryKeys.cinemas.sessions(id.value)),
    queryFn: ({ signal }) => cinemasRepository.getSessions(id.value, signal),
    enabled: computed(() => id.value > 0),
    staleTime: 1000 * 30,
    keepPreviousData: true
  })
}
