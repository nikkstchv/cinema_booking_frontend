import type { MovieSession } from '~/shared/schemas'
import { formatDate } from '~/shared/lib/formatters'

export function useSessionsGrouping(sessions: Ref<MovieSession[]>) {
  const groupedSessions = computed(() => {
    const groups: Record<string, MovieSession[]> = {}

    for (const session of sessions.value) {
      const date = formatDate(session.startTime)
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(session)
    }

    for (const date in groups) {
      const group = groups[date]
      if (group) {
        group.sort((a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        )
      }
    }

    return groups
  })

  const dates = computed(() => Object.keys(groupedSessions.value).sort())

  return {
    groupedSessions,
    dates
  }
}
