import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LoginForm from '~/features/auth/components/LoginForm.vue'
import { useAuth } from '~/features/auth/composables/useAuth'
import { useErrorHandler } from '~/composables/useErrorHandler'

vi.mock('~/features/auth/composables/useAuth')
vi.mock('~/composables/useErrorHandler')
vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ push: vi.fn() })
}))

describe('LoginForm', () => {
  const mockLogin = vi.fn()
  const mockHandleError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      token: computed(() => null),
      user: computed(() => null),
      isAuthenticated: computed(() => false),
      init: vi.fn(),
      register: vi.fn(),
      logout: vi.fn()
    } as ReturnType<typeof useAuth>)
    vi.mocked(useErrorHandler).mockReturnValue({
      handleError: mockHandleError
    })
  })

  it('renders login form', () => {
    const wrapper = mount(LoginForm)
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
  })

  it('validates username minimum length', async () => {
    const wrapper = mount(LoginForm)
    const usernameInput = wrapper.find('input[type="text"]')

    await usernameInput.setValue('short')
    await wrapper.find('form').trigger('submit')

    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('validates password minimum length', async () => {
    const wrapper = mount(LoginForm)
    const usernameInput = wrapper.find('input[type="text"]')
    const passwordInput = wrapper.find('input[type="password"]')

    await usernameInput.setValue('validusername')
    await passwordInput.setValue('short')
    await wrapper.find('form').trigger('submit')

    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('calls login with valid credentials', async () => {
    mockLogin.mockResolvedValue({ token: 'test-token' })

    const wrapper = mount(LoginForm)
    const usernameInput = wrapper.find('input[type="text"]')
    const passwordInput = wrapper.find('input[type="password"]')

    await usernameInput.setValue('validusername')
    await passwordInput.setValue('validpassword123')
    await wrapper.find('form').trigger('submit')

    await wrapper.vm.$nextTick()
    expect(mockLogin).toHaveBeenCalledWith({
      username: 'validusername',
      password: 'validpassword123'
    })
  })
})
