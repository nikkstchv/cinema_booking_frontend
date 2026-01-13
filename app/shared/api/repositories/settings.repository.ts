import { useApiClient, ApiError } from '../client'
import { SettingsSchema, type Settings } from '../../schemas'
import { logger } from '../../lib/logger'
import { API_ENDPOINTS } from '../../lib/api-endpoints'

export const settingsRepository = {
  async get(signal?: AbortSignal): Promise<Settings> {
    const client = useApiClient()
    const response = await client.get(API_ENDPOINTS.SETTINGS.GET, { signal })

    const result = SettingsSchema.safeParse(response)
    if (!result.success) {
      const errorDetails = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      logger.error('Settings response validation failed:', result.error)
      throw new ApiError(`Неверный формат ответа сервера при получении настроек: ${errorDetails}`, 500)
    }

    return result.data
  }
}
