<script setup lang="ts">
import RegisterForm from '~/features/auth/components/RegisterForm.vue'
import { APP_ROUTES } from '~/shared/lib/app-routes'

definePageMeta({
  layout: 'auth'
})

const baseUrl = useBaseUrl()

useHead({
  title: 'Регистрация - CinemaBook',
  meta: [
    { name: 'description', content: 'Создайте аккаунт для бронирования билетов в кинотеатры' },
    { name: 'robots', content: 'noindex, nofollow' }
  ],
  link: [
    { rel: 'canonical', href: () => `${baseUrl.value}${APP_ROUTES.AUTH.REGISTER}` }
  ]
})
</script>

<template>
  <RegisterForm />
</template>
