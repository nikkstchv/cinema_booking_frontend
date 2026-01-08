import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import RegisterForm from '~/features/auth/components/RegisterForm.vue'
import { useAuth } from '~/features/auth/composables/useAuth'
import { useErrorHandler } from '~/composables/useErrorHandler'
import { ApiError } from '~/shared/api/client'

vi.mock('~/features/auth/composables/useAuth')
vi.mock('~/composables/useErrorHandler')

describe('RegisterForm', () => {
  let mockRegister: ReturnType<typeof vi.fn>
  let mockHandleError: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockRegister = vi.fn()
    mockHandleError = vi.fn()

    vi.mocked(useAuth).mockReturnValue({
      register: mockRegister,
      token: computed(() => null),
      user: computed(() => null),
      isAuthenticated: computed(() => false),
      init: vi.fn(),
      login: vi.fn(),
      logout: vi.fn()
    } as ReturnType<typeof useAuth>)

    vi.mocked(useErrorHandler).mockReturnValue({
      handleError: mockHandleError
    })
  })

  describe('rendering', () => {
    it('renders registration form with all required fields', () => {
      const wrapper = mount(RegisterForm)

      expect(wrapper.find('[data-testid="register-form"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="username-input"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="password-input"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="password-confirmation-input"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="submit-button"]').exists()).toBe(true)
    })
  })

  describe('validation', () => {
    context('when password does not meet requirements', () => {
      it('validates password requirements', async () => {
        const wrapper = mount(RegisterForm)
        const usernameInput = wrapper.find('[data-testid="username-input"]')
        const passwordInput = wrapper.find('[data-testid="password-input"]')
        const form = wrapper.find('[data-testid="register-form"]')

        await usernameInput.setValue('validusername')
        await passwordInput.setValue('passwordwithoutuppercase1')
        await form.trigger('submit')

        expect(mockRegister).not.toHaveBeenCalled()
      })
    })

    context('when password confirmation does not match', () => {
      it('validates password confirmation match', async () => {
        const wrapper = mount(RegisterForm)
        const usernameInput = wrapper.find('[data-testid="username-input"]')
        const passwordInput = wrapper.find('[data-testid="password-input"]')
        const passwordConfirmationInput = wrapper.find('[data-testid="password-confirmation-input"]')
        const form = wrapper.find('[data-testid="register-form"]')

        await usernameInput.setValue('validusername')
        await passwordInput.setValue('ValidPassword1')
        await passwordConfirmationInput.setValue('ValidPassword2')
        await form.trigger('submit')

        expect(mockRegister).not.toHaveBeenCalled()
      })
    })
  })

  describe('submission', () => {
    context('with valid data', () => {
      it('calls register with valid data', async () => {
        mockRegister.mockResolvedValue({ token: 'test-token' })

        const wrapper = mount(RegisterForm)
        const usernameInput = wrapper.find('[data-testid="username-input"]')
        const passwordInput = wrapper.find('[data-testid="password-input"]')
        const passwordConfirmationInput = wrapper.find('[data-testid="password-confirmation-input"]')
        const form = wrapper.find('[data-testid="register-form"]')

        await usernameInput.setValue('validusername')
        await passwordInput.setValue('ValidPassword1')
        await passwordConfirmationInput.setValue('ValidPassword1')
        await form.trigger('submit')

        await wrapper.vm.$nextTick()
        expect(mockRegister).toHaveBeenCalledTimes(1)
        expect(mockRegister).toHaveBeenCalledWith({
          username: 'validusername',
          password: 'ValidPassword1',
          passwordConfirmation: 'ValidPassword1'
        })
      })
    })

    context('with invalid data', () => {
      it('handles registration error', async () => {
        const error = new ApiError('Username already exists', 409)
        mockRegister.mockRejectedValue(error)

        const wrapper = mount(RegisterForm)
        const usernameInput = wrapper.find('[data-testid="username-input"]')
        const passwordInput = wrapper.find('[data-testid="password-input"]')
        const passwordConfirmationInput = wrapper.find('[data-testid="password-confirmation-input"]')
        const form = wrapper.find('[data-testid="register-form"]')

        await usernameInput.setValue('validusername')
        await passwordInput.setValue('ValidPassword1')
        await passwordConfirmationInput.setValue('ValidPassword1')
        await form.trigger('submit')

        await wrapper.vm.$nextTick()
        expect(mockRegister).toHaveBeenCalledTimes(1)
        expect(mockHandleError).toHaveBeenCalledTimes(1)
        expect(mockHandleError).toHaveBeenCalledWith(error)
      })

      it('handles network errors', async () => {
        const error = new Error('Network error')
        mockRegister.mockRejectedValue(error)

        const wrapper = mount(RegisterForm)
        const usernameInput = wrapper.find('[data-testid="username-input"]')
        const passwordInput = wrapper.find('[data-testid="password-input"]')
        const passwordConfirmationInput = wrapper.find('[data-testid="password-confirmation-input"]')
        const form = wrapper.find('[data-testid="register-form"]')

        await usernameInput.setValue('validusername')
        await passwordInput.setValue('ValidPassword1')
        await passwordConfirmationInput.setValue('ValidPassword1')
        await form.trigger('submit')

        await wrapper.vm.$nextTick()
        expect(mockHandleError).toHaveBeenCalledTimes(1)
        expect(mockHandleError).toHaveBeenCalledWith(error)
      })
    })
  })
})
