import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import RegisterForm from '~/features/auth/components/RegisterForm.vue'
import { useAuth } from '~/features/auth/composables/useAuth'
import { useErrorHandler } from '~/composables/useErrorHandler'

vi.mock('~/features/auth/composables/useAuth')
vi.mock('~/composables/useErrorHandler')

describe('RegisterForm', () => {
  const mockRegister = vi.fn()
  const mockHandleError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
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

  it('renders registration form', () => {
    const wrapper = mount(RegisterForm)
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    expect(wrapper.findAll('input[type="password"]').length).toBe(2)
  })

  it('validates password requirements', async () => {
    const wrapper = mount(RegisterForm)
    const usernameInput = wrapper.find('input[type="text"]')
    const passwordInput = wrapper.findAll('input[type="password"]')[0]

    await usernameInput.setValue('validusername')
    await passwordInput.setValue('passwordwithoutuppercase1')
    await wrapper.find('form').trigger('submit')

    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('validates password confirmation match', async () => {
    const wrapper = mount(RegisterForm)
    const usernameInput = wrapper.find('input[type="text"]')
    const passwordInputs = wrapper.findAll('input[type="password"]')

    await usernameInput.setValue('validusername')
    await passwordInputs[0].setValue('ValidPassword1')
    await passwordInputs[1].setValue('ValidPassword2')
    await wrapper.find('form').trigger('submit')

    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('calls register with valid data', async () => {
    mockRegister.mockResolvedValue({ token: 'test-token' })

    const wrapper = mount(RegisterForm)
    const usernameInput = wrapper.find('input[type="text"]')
    const passwordInputs = wrapper.findAll('input[type="password"]')

    await usernameInput.setValue('validusername')
    await passwordInputs[0].setValue('ValidPassword1')
    await passwordInputs[1].setValue('ValidPassword1')
    await wrapper.find('form').trigger('submit')

    await wrapper.vm.$nextTick()
    expect(mockRegister).toHaveBeenCalledWith({
      username: 'validusername',
      password: 'ValidPassword1'
    })
  })
})
