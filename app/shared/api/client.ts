/**
 * API Client with AbortController support
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface RequestOptions extends RequestInit {
  signal?: AbortSignal
}

export class ApiClient {
  private baseUrl: string
  private getToken: () => string | null

  constructor(baseUrl: string, getToken: () => string | null) {
    this.baseUrl = baseUrl
    this.getToken = getToken
  }

  async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const token = this.getToken()

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      }
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }))
      throw new ApiError(error.message || 'Request failed', response.status)
    }

    return response.json()
  }

  get<T>(endpoint: string, options?: { signal?: AbortSignal }): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', ...options })
  }

  post<T>(endpoint: string, data: unknown, options?: { signal?: AbortSignal }): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options
    })
  }
}

// Singleton instance - will be created in plugin
let apiClientInstance: ApiClient | null = null

export function createApiClient(baseUrl: string, getToken: () => string | null): ApiClient {
  apiClientInstance = new ApiClient(baseUrl, getToken)
  return apiClientInstance
}

export function useApiClient(): ApiClient {
  if (!apiClientInstance) {
    throw new Error('ApiClient not initialized. Make sure to call createApiClient first.')
  }
  return apiClientInstance
}
