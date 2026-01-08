<script setup lang="ts">
import { RegisterRequestSchema } from '~/shared/schemas'
import { useAuth } from '../composables/useAuth'
import type { FormSubmitEvent } from '#ui/types'

const toast = useToast()
const { register } = useAuth()
const { handleError } = useErrorHandler()

const isLoading = ref(false)

const form = reactive({
  username: '',
  password: '',
  passwordConfirmation: ''
})

type FormData = typeof form

const onSubmit = async (event: FormSubmitEvent<FormData>) => {
  isLoading.value = true

  try {
    await register({
      username: event.data.username,
      password: event.data.password
    })

    toast.add({
      title: 'Успешно!',
      description: 'Аккаунт создан',
      color: 'green',
      icon: 'i-lucide-check-circle'
    })

    navigateTo('/my-tickets')
  } catch (error) {
    handleError(error)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <UCard class="max-w-md w-full">
    <template #header>
      <h1 class="text-2xl font-bold text-gray-900">
        Регистрация
      </h1>
      <p class="mt-1 text-sm text-gray-500">
        Создайте аккаунт для бронирования билетов
      </p>
    </template>

    <UForm
      :schema="RegisterRequestSchema"
      :state="form"
      class="space-y-4"
      aria-label="Форма регистрации"
      @submit="onSubmit"
    >
      <UFormGroup
        label="Логин"
        name="username"
      >
        <UInput
          v-model="form.username"
          placeholder="Минимум 8 символов"
          icon="i-lucide-user"
          size="lg"
          autocomplete="username"
        />
      </UFormGroup>

      <UFormGroup
        label="Пароль"
        name="password"
      >
        <UInput
          v-model="form.password"
          type="password"
          placeholder="Минимум 8 символов, 1 заглавная, 1 цифра"
          icon="i-lucide-lock"
          size="lg"
          autocomplete="new-password"
        />
      </UFormGroup>

      <UFormGroup
        label="Подтверждение пароля"
        name="passwordConfirmation"
      >
        <UInput
          v-model="form.passwordConfirmation"
          type="password"
          placeholder="Повторите пароль"
          icon="i-lucide-lock"
          size="lg"
          autocomplete="new-password"
        />
      </UFormGroup>

      <UButton
        type="submit"
        block
        size="lg"
        :loading="isLoading"
      >
        Зарегистрироваться
      </UButton>
    </UForm>

    <template #footer>
      <p class="text-sm text-center text-gray-500">
        Уже есть аккаунт?
        <NuxtLink
          to="/login"
          class="text-indigo-600 hover:text-indigo-500 font-medium"
        >
          Войдите
        </NuxtLink>
      </p>
    </template>
  </UCard>
</template>
