import { MIME_TYPES } from '../lib/mime-types'

/**
 * API Client with AbortController support
 *
 * @class ApiClient
 * @description Centralized API client for making HTTP requests with authentication and error handling
 */

/**
 * Custom error class for API errors
 * @class ApiError
 * @extends Error
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

/**
 * API Client for making authenticated HTTP requests
 */
export class ApiClient {
  private baseUrl: string
  private getToken: () => string | null

  /**
   * Creates a new API client instance
   * @param baseUrl - Base URL for API requests
   * @param getToken - Function to get authentication token
   */
  constructor(baseUrl: string, getToken: () => string | null) {
    this.baseUrl = baseUrl
    this.getToken = getToken
  }

  /**
   * Makes an HTTP request
   * @param endpoint - API endpoint path
   * @param options - Request options (method, body, headers, signal)
   * @returns Promise resolving to response data (unknown - should be validated in repositories)
   * @throws ApiError if request fails
   */
  async request(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<unknown> {
    const token = this.getToken()

    let response: Response
    try {
      response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': MIME_TYPES.JSON,
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers
        }
      })
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiError('Не удалось подключиться к серверу. Проверьте подключение к интернету', 0)
      }
      throw error
    }

    if (!response.ok) {
      let errorMessage = 'Запрос не выполнен'
      const contentType = response.headers.get('content-type')

      if (contentType?.includes(MIME_TYPES.JSON)) {
        try {
          const error = await response.json()
          errorMessage = error.message || error.error || `Ошибка ${response.status}`
        } catch {
          errorMessage = `Ошибка ${response.status}: ${response.statusText}`
        }
      } else {
        try {
          const text = await response.text()
          errorMessage = text || `Ошибка ${response.status}: ${response.statusText}`
        } catch {
          errorMessage = `Ошибка ${response.status}: ${response.statusText}`
        }
      }

      throw new ApiError(errorMessage, response.status)
    }

    const contentType = response.headers.get('content-type')
    if (!contentType?.includes(MIME_TYPES.JSON)) {
      const text = await response.text()
      if (text) {
        try {
          return JSON.parse(text)
        } catch {
          throw new ApiError('Сервер вернул неверный формат данных', response.status)
        }
      }
      return null
    }

    try {
      return response.json()
    } catch {
      throw new ApiError('Не удалось обработать ответ сервера', response.status)
    }
  }

  /**
   * Makes a GET request
   * @param endpoint - API endpoint path
   * @param options - Request options with optional AbortSignal
   * @returns Promise resolving to response data (unknown - should be validated in repositories)
   */
  get(endpoint: string, options?: { signal?: AbortSignal }): Promise<unknown> {
    return this.request(endpoint, { method: 'GET', ...options })
  }

  /**
   * Makes a POST request
   * @param endpoint - API endpoint path
   * @param data - Request body data
   * @param options - Request options with optional AbortSignal
   * @returns Promise resolving to response data (unknown - should be validated in repositories)
   */
  post(endpoint: string, data: unknown, options?: { signal?: AbortSignal }): Promise<unknown> {
    return this.request(endpoint, {
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
