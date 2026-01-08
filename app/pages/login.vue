<script setup lang="ts">
import LoginForm from '~/features/auth/components/LoginForm.vue'

definePageMeta({
  layout: 'auth'
})

const baseUrl = useBaseUrl()

useHead({
  title: 'Вход - CinemaBook',
  meta: [
    { name: 'description', content: 'Войдите в аккаунт для бронирования билетов в кинотеатры' },
    { name: 'robots', content: 'noindex, nofollow' }
  ],
  link: [
    { rel: 'canonical', href: () => `${baseUrl.value}/login` }
  ]
})
</script>

<template>
  <LoginForm />
</template>
