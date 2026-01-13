import type { Booking, MovieSession } from '~/shared/schemas'

export type BookingCategory = 'unpaid' | 'future' | 'past'

export const BOOKING_CATEGORIES: readonly BookingCategory[] = ['unpaid', 'future', 'past'] as const

export const CATEGORY_LABELS: Record<BookingCategory, string> = {
  unpaid: 'Неоплаченные',
  future: 'Будущие',
  past: 'Прошедшие'
} as const

export function getBookingCategory(booking: Booking, session: MovieSession | undefined): BookingCategory {
  if (!booking.isPaid) {
    return 'unpaid'
  }

  if (!session) {
    return 'future'
  }

  const sessionTime = new Date(session.startTime).getTime()
  const now = Date.now()

  return sessionTime > now ? 'future' : 'past'
}

export function useBookingCategories(
  bookings: Ref<Booking[]>,
  getSession: (booking: Booking) => MovieSession | undefined
) {
  const groupedBookings = computed(() => {
    const groups: Record<BookingCategory, Booking[]> = {
      unpaid: [],
      future: [],
      past: []
    }

    bookings.value.forEach((booking) => {
      const session = getSession(booking)
      const category = getBookingCategory(booking, session)
      groups[category].push(booking)
    })

    Object.values(groups).forEach((group) => {
      group.sort((a, b) => {
        const sessionA = getSession(a)
        const sessionB = getSession(b)
        if (sessionA && sessionB) {
          return new Date(sessionB.startTime).getTime() - new Date(sessionA.startTime).getTime()
        }
        return new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime()
      })
    })

    return groups
  })

  return {
    groupedBookings
  }
}
