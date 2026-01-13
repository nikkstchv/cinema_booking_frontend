import type { Seat } from '~/shared/schemas'

export function sortSeats(seats: Seat[]): Seat[] {
  return [...seats].sort((a, b) => a.rowNumber - b.rowNumber || a.seatNumber - b.seatNumber)
}

export function calculateRemainingSeconds(bookedAt: string, timeoutSeconds: number): number {
  if (import.meta.server) {
    return 0
  }
  const bookedTime = new Date(bookedAt).getTime()
  const expiryTime = bookedTime + timeoutSeconds * 1000
  const now = Date.now()
  const remaining = Math.floor((expiryTime - now) / 1000)
  return Math.max(0, remaining)
}
