<script setup lang="ts">
import type { Cinema } from '~/shared/schemas'

defineProps<{
  cinema: Cinema
}>()
</script>

<template>
  <NuxtLink
    :to="`/cinemas/${cinema.id}`"
    class="block group"
    :data-testid="`cinema-link-${cinema.id}`"
  >
    <UCard class="transition-shadow hover:shadow-lg h-full">
      <div class="flex items-start gap-4">
        <div class="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
          <UIcon
            name="i-lucide-building-2"
            class="w-6 h-6 text-indigo-600"
          />
        </div>

        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
            {{ cinema.name }}
          </h3>
          <p class="mt-1 text-sm text-gray-500 flex items-center gap-1">
            <UIcon
              name="i-lucide-map-pin"
              class="w-4 h-4 flex-shrink-0"
            />
            <span class="truncate">{{ cinema.address }}</span>
          </p>
        </div>

        <UIcon
          name="i-lucide-chevron-right"
          class="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors flex-shrink-0"
        />
      </div>
    </UCard>
  </NuxtLink>
</template>
