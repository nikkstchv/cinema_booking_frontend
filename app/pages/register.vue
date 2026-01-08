<script setup lang="ts">
import RegisterForm from '~/features/auth/components/RegisterForm.vue'

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
    { rel: 'canonical', href: () => `${baseUrl.value}/register` }
  ]
})
</script>

<template>
  <RegisterForm />
</template>
