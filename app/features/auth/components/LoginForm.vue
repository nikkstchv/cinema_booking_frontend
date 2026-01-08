<script setup lang="ts">
import { LoginRequestSchema } from '~/shared/schemas'
import { useAuth } from '../composables/useAuth'
import type { FormSubmitEvent } from '#ui/types'

const route = useRoute()
const toast = useToast()
const { login } = useAuth()
const { handleError } = useErrorHandler()

const isLoading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

type FormData = typeof form

const onSubmit = async (event: FormSubmitEvent<FormData>) => {
  isLoading.value = true

  try {
    await login(event.data)

    toast.add({
      title: 'Успешно!',
      description: 'Вы вошли в систему',
      color: 'green',
      icon: 'i-lucide-check-circle'
    })

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/my-tickets'
    navigateTo(redirect)
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
        Вход в систему
      </h1>
      <p class="mt-1 text-sm text-gray-500">
        Введите ваши данные для входа
      </p>
    </template>

    <UForm
      :schema="LoginRequestSchema"
      :state="form"
      class="space-y-4"
      aria-label="Форма входа"
      @submit="onSubmit"
    >
      <UFormGroup
        label="Логин"
        name="username"
      >
        <UInput
          v-model="form.username"
          placeholder="Введите логин"
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
          placeholder="Введите пароль"
          icon="i-lucide-lock"
          size="lg"
          autocomplete="current-password"
        />
      </UFormGroup>

      <UButton
        type="submit"
        block
        size="lg"
        :loading="isLoading"
      >
        Войти
      </UButton>
    </UForm>

    <template #footer>
      <p class="text-sm text-center text-gray-500">
        Нет аккаунта?
        <NuxtLink
          to="/register"
          class="text-indigo-600 hover:text-indigo-500 font-medium"
        >
          Зарегистрируйтесь
        </NuxtLink>
      </p>
    </template>
  </UCard>
</template>
