export interface StorageAdapter {
  get: (key: string) => string | null
  set: (key: string, value: string, options?: { maxAge?: number, secure?: boolean, sameSite?: 'strict' | 'lax' | 'none' }) => void
  remove: (key: string) => void
}

export function useStorage(key: string, options?: { maxAge?: number, secure?: boolean, sameSite?: 'strict' | 'lax' | 'none' }) {
  const cookie = useCookie(key, {
    maxAge: options?.maxAge,
    secure: options?.secure ?? import.meta.env.PROD,
    sameSite: options?.sameSite ?? 'strict'
  })

  return {
    value: computed({
      get: () => cookie.value,
      set: (newValue: string | null) => {
        cookie.value = newValue
      }
    })
  }
}
