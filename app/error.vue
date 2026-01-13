<script setup lang="ts">
import type { NuxtError } from '#app'
import { APP_ROUTES } from '~/shared/lib/app-routes'
import { HTTP_STATUS_CODES } from '~/shared/lib/constants'

const props = defineProps<{
  error: NuxtError
}>()

const handleError = () => {
  clearError({ redirect: APP_ROUTES.MOVIES.INDEX })
}

const ERROR_TITLE_MAP: Record<number, string> = {
  [HTTP_STATUS_CODES.NOT_FOUND]: 'Страница не найдена',
  [HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR]: 'Ошибка сервера'
} as const

const errorTitle = computed(() => {
  return ERROR_TITLE_MAP[props.error.statusCode] || 'Произошла ошибка'
})

const errorDescription = computed(() => {
  return props.error.message || 'Что-то пошло не так. Попробуйте позже.'
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <UCard class="max-w-md w-full">
      <template #header>
        <div class="flex items-center gap-3">
          <UIcon
            name="i-lucide-alert-triangle"
            class="w-8 h-8 text-red-500"
          />
          <div>
            <h1 class="text-xl font-bold text-gray-900">
              {{ errorTitle }}
            </h1>
            <p class="text-sm text-gray-500">
              Код ошибки: {{ error.statusCode }}
            </p>
          </div>
        </div>
      </template>

      <p class="text-gray-600 mb-6">
        {{ errorDescription }}
      </p>

      <UButton
        block
        size="lg"
        @click="handleError"
      >
        Вернуться на главную
      </UButton>
    </UCard>
  </div>
</template>
