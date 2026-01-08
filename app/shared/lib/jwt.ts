import { JWTPayloadSchema } from '~/shared/schemas'

export interface DecodedToken {
  id: number
  exp?: number
}

export function decodeJWT(token: string): DecodedToken | null {
  try {
    const parts = token.split('.')

    if (parts.length !== 3 || !parts[1]) {
      return null
    }

    const decodedPayload = JSON.parse(atob(parts[1]))
    const result = JWTPayloadSchema.safeParse(decodedPayload)

    if (!result.success) {
      return null
    }

    const payload = result.data

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null
    }

    const userId = payload.sub ?? payload.id

    if (!userId || typeof userId !== 'number') {
      return null
    }

    return {
      id: userId,
      exp: payload.exp
    }
  } catch {
    return null
  }
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token)
  if (!decoded || !decoded.exp) return true
  return decoded.exp * 1000 < Date.now()
}
