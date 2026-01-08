/**
 * Format duration in minutes to human readable string
 * @param minutes - Duration in minutes
 * @returns Formatted string like "2:32" or "1:45"
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}:${mins.toString().padStart(2, '0')}`
}

/**
 * Format date to Russian locale string
 * @param date - Date string or Date object
 * @returns Formatted date like "24.07"
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit'
  })
}

/**
 * Format time from date
 * @param date - Date string or Date object
 * @returns Formatted time like "15:30"
 */
export function formatTime(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Format date and time together
 * @param date - Date string or Date object
 * @returns Formatted string like "24.07 15:30"
 */
export function formatDateTime(date: string | Date): string {
  return `${formatDate(date)} ${formatTime(date)}`
}

/**
 * Get full poster URL
 * @param posterPath - Relative poster path from API
 * @param baseUrl - API base URL
 * @returns Full poster URL
 */
export function getFullPosterUrl(posterPath: string, baseUrl: string): string {
  if (!posterPath) return ''
  if (posterPath.startsWith('http')) return posterPath
  return `${baseUrl}${posterPath}`
}
