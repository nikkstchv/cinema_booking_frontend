import { ApiError } from '~/shared/api/client'

export type AppError = ApiError | Error | TypeError | unknown

export interface ErrorDetails {
  message: string
  status?: number
  code?: string
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    return error.message.includes('fetch') || error.message.includes('network')
  }
  if (isApiError(error)) {
    return error.status === 0
  }
  return false
}

export function getErrorDetails(error: AppError): ErrorDetails {
  if (isApiError(error)) {
    return {
      message: error.message,
      status: error.status
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message
    }
  }

  return {
    message: 'Произошла неизвестная ошибка'
  }
}
