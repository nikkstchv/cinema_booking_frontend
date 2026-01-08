import { useApiClient, ApiError } from '../client'
import { SettingsSchema, type Settings } from '../../schemas'

export const settingsRepository = {
  async get(signal?: AbortSignal): Promise<Settings> {
    const client = useApiClient()
    const response = await client.get<unknown>('/settings', { signal })

    const result = SettingsSchema.safeParse(response)
    if (!result.success) {
      console.error('Settings response validation failed:', result.error)
      throw new ApiError('Invalid settings response', 500)
    }

    return result.data
  }
}
