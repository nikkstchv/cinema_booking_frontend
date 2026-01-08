<script setup lang="ts">
import type { Cinema } from '~/shared/schemas'
import CinemaCard from './CinemaCard.vue'

defineProps<{
  cinemas: Cinema[]
  loading?: boolean
}>()
</script>

<template>
  <div>
    <!-- Loading skeletons -->
    <div
      v-if="loading"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <UCard
        v-for="i in 6"
        :key="i"
      >
        <div class="flex items-start gap-4">
          <USkeleton class="w-12 h-12 rounded-lg" />
          <div class="flex-1 space-y-2">
            <USkeleton class="h-5 w-3/4" />
            <USkeleton class="h-4 w-full" />
          </div>
        </div>
      </UCard>
    </div>

    <!-- Cinemas list -->
    <div
      v-else-if="cinemas.length"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <CinemaCard
        v-for="cinema in cinemas"
        :key="cinema.id"
        :cinema="cinema"
      />
    </div>

    <!-- Empty state -->
    <UCard
      v-else
      class="text-center py-12"
    >
      <UIcon
        name="i-lucide-building-2"
        class="w-12 h-12 mx-auto text-gray-400 mb-4"
      />
      <h3 class="text-lg font-medium text-gray-900 mb-2">
        Кинотеатры не найдены
      </h3>
      <p class="text-gray-500">
        Попробуйте обновить страницу
      </p>
    </UCard>
  </div>
</template>
