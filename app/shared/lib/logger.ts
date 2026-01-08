const isDevelopment = typeof import.meta !== 'undefined' ? import.meta.env.DEV : process.env.NODE_ENV !== 'production'

export const logger = {
  error: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.error(`[Error] ${message}`, ...args)
    }
  },
  warn: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.warn(`[Warn] ${message}`, ...args)
    }
  },
  info: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.info(`[Info] ${message}`, ...args)
    }
  },
  debug: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.debug(`[Debug] ${message}`, ...args)
    }
  }
}
