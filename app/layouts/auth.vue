<script setup lang="ts">
import { APP_ROUTES } from '~/shared/lib/app-routes'
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="absolute top-4 left-4">
      <NuxtLink
        :to="APP_ROUTES.MOVIES.INDEX"
        class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <UIcon
          name="i-lucide-arrow-left"
          class="w-4 h-4"
        />
        <span>На главную</span>
      </NuxtLink>
    </div>
    <slot />
  </div>
</template>
