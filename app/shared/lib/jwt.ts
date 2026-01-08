interface JWTPayload {
  sub?: number
  id?: number
  exp?: number
  iat?: number
  [key: string]: unknown
}

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

    const payload = JSON.parse(atob(parts[1])) as JWTPayload

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null
    }

    const userId = payload.sub ?? payload.id

    if (!userId) {
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
