<script setup lang="ts">
import RegisterForm from '~/features/auth/components/RegisterForm.vue'

definePageMeta({
  layout: 'auth'
})

const config = useRuntimeConfig()

const baseUrl = computed(() => {
  if (process.client) {
    return window.location.origin
  }
  return config.public.apiBase.replace('/api', '') || 'http://localhost:3000'
})

useHead({
  title: 'Регистрация - CinemaBook',
  meta: [
    { name: 'description', content: 'Создайте аккаунт для бронирования билетов в кинотеатры' },
    { name: 'robots', content: 'noindex, nofollow' }
  ],
  link: [
    { rel: 'canonical', href: () => `${baseUrl.value}/register` }
  ]
})
</script>

<template>
  <RegisterForm />
</template>
