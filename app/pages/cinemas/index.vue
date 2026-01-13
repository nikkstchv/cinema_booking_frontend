<script setup lang="ts">
import CinemaList from '~/features/cinemas/components/CinemaList.vue'
import { useCinemas } from '~/features/cinemas'
import { APP_ROUTES } from '~/shared/lib/app-routes'

const baseUrl = useBaseUrl()

useHead({
  title: 'Кинотеатры - CinemaBook',
  meta: [
    { name: 'description', content: 'Список всех кинотеатров. Выберите кинотеатр и забронируйте билеты на сеансы.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: 'Кинотеатры - CinemaBook' },
    { property: 'og:description', content: 'Список всех кинотеатров. Выберите кинотеатр и забронируйте билеты на сеансы.' },
    { property: 'og:url', content: () => `${baseUrl.value}${APP_ROUTES.CINEMAS.INDEX}` },
    { property: 'og:site_name', content: 'CinemaBook' }
  ],
  link: [
    { rel: 'canonical', href: () => `${baseUrl.value}${APP_ROUTES.CINEMAS.INDEX}` }
  ]
})

const { data: cinemas, isLoading, error } = useCinemas()
const { handleError } = useErrorHandler()

// Handle query errors
watch(error, (err) => {
  if (err) handleError(err)
})
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900 mb-8">
      Кинотеатры
    </h1>

    <CinemaList
      :cinemas="cinemas ?? []"
      :loading="isLoading"
    />
  </div>
</template>
