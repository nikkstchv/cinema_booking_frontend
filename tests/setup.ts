import { config } from '@vue/test-utils'
import { vi } from 'vitest'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'

// Mock Nuxt composables
vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    public: {
      apiBase: 'http://localhost:3022'
    }
  }),
  navigateTo: vi.fn(),
  useRoute: () => ({
    query: {},
    params: {},
    fullPath: '/',
    path: '/'
  }),
  useCookie: vi.fn(() => ({ value: null })),
  useState: vi.fn((key: string, init: () => unknown) => ({ value: init() })),
  useToast: vi.fn(() => ({
    add: vi.fn()
  })),
  createError: vi.fn((options: any) => {
    const error = new Error(options.message)
    ;(error as any).statusCode = options.statusCode
    return error
  })
}))

// Setup Vue Query for tests
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false
    }
  }
})

config.global.plugins = [[VueQueryPlugin, { queryClient }]]

// Mock Nuxt UI components
const createStub = (name: string) => ({
  name,
  template: `<div data-testid="${name.toLowerCase()}"><slot /></div>`,
  props: []
})

// Global test config
config.global.stubs = {
  NuxtLink: {
    template: '<a><slot /></a>',
    props: ['to']
  },
  UCard: createStub('UCard'),
  UButton: createStub('UButton'),
  UInput: createStub('UInput'),
  UForm: createStub('UForm'),
  UFormGroup: createStub('UFormGroup'),
  UIcon: createStub('UIcon'),
  USkeleton: createStub('USkeleton'),
  UModal: createStub('UModal'),
  UBadge: createStub('UBadge'),
  UNotifications: createStub('UNotifications')
}
