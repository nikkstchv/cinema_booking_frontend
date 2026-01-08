import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LoginForm from '~/features/auth/components/LoginForm.vue'
import { useAuth } from '~/features/auth/composables/useAuth'
import { useErrorHandler } from '~/composables/useErrorHandler'
import { ApiError } from '~/shared/api/client'

vi.mock('~/features/auth/composables/useAuth')
vi.mock('~/composables/useErrorHandler')
vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ push: vi.fn() })
}))

describe('LoginForm', () => {
  let mockLogin: ReturnType<typeof vi.fn>
  let mockHandleError: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockLogin = vi.fn()
    mockHandleError = vi.fn()

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

  describe('rendering', () => {
    it('renders login form with all required fields', () => {
      const wrapper = mount(LoginForm)

      expect(wrapper.find('[data-testid="login-form"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="username-input"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="password-input"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="submit-button"]').exists()).toBe(true)
    })
  })

  describe('validation', () => {
    context('when username is too short', () => {
      it('validates username minimum length', async () => {
        const wrapper = mount(LoginForm)
        const usernameInput = wrapper.find('[data-testid="username-input"]')
        const form = wrapper.find('[data-testid="login-form"]')

        await usernameInput.setValue('short')
        await form.trigger('submit')

        expect(mockLogin).not.toHaveBeenCalled()
      })
    })

    context('when password is too short', () => {
      it('validates password minimum length', async () => {
        const wrapper = mount(LoginForm)
        const usernameInput = wrapper.find('[data-testid="username-input"]')
        const passwordInput = wrapper.find('[data-testid="password-input"]')
        const form = wrapper.find('[data-testid="login-form"]')

        await usernameInput.setValue('validusername')
        await passwordInput.setValue('short')
        await form.trigger('submit')

        expect(mockLogin).not.toHaveBeenCalled()
      })
    })
  })

  describe('submission', () => {
    context('with valid credentials', () => {
      it('calls login with valid credentials', async () => {
        mockLogin.mockResolvedValue({ token: 'test-token' })

        const wrapper = mount(LoginForm)
        const usernameInput = wrapper.find('[data-testid="username-input"]')
        const passwordInput = wrapper.find('[data-testid="password-input"]')
        const form = wrapper.find('[data-testid="login-form"]')

        await usernameInput.setValue('validusername')
        await passwordInput.setValue('validpassword123')
        await form.trigger('submit')

        await wrapper.vm.$nextTick()
        expect(mockLogin).toHaveBeenCalledTimes(1)
        expect(mockLogin).toHaveBeenCalledWith({
          username: 'validusername',
          password: 'validpassword123'
        })
      })
    })

    context('with invalid credentials', () => {
      it('handles login error', async () => {
        const error = new ApiError('Invalid credentials', 401)
        mockLogin.mockRejectedValue(error)

        const wrapper = mount(LoginForm)
        const usernameInput = wrapper.find('[data-testid="username-input"]')
        const passwordInput = wrapper.find('[data-testid="password-input"]')
        const form = wrapper.find('[data-testid="login-form"]')

        await usernameInput.setValue('validusername')
        await passwordInput.setValue('validpassword123')
        await form.trigger('submit')

        await wrapper.vm.$nextTick()
        expect(mockLogin).toHaveBeenCalledTimes(1)
        expect(mockHandleError).toHaveBeenCalledTimes(1)
        expect(mockHandleError).toHaveBeenCalledWith(error)
      })

      it('handles network errors', async () => {
        const error = new Error('Network error')
        mockLogin.mockRejectedValue(error)

        const wrapper = mount(LoginForm)
        const usernameInput = wrapper.find('[data-testid="username-input"]')
        const passwordInput = wrapper.find('[data-testid="password-input"]')
        const form = wrapper.find('[data-testid="login-form"]')

        await usernameInput.setValue('validusername')
        await passwordInput.setValue('validpassword123')
        await form.trigger('submit')

        await wrapper.vm.$nextTick()
        expect(mockHandleError).toHaveBeenCalledTimes(1)
        expect(mockHandleError).toHaveBeenCalledWith(error)
      })
    })
  })
})
