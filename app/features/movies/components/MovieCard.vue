<script setup lang="ts">
import type { Movie } from '~/shared/schemas'
import { formatDuration, getFullPosterUrl } from '~/shared/lib/formatters'

const props = defineProps<{
  movie: Movie
}>()

const config = useRuntimeConfig()

const posterUrl = computed(() =>
  getFullPosterUrl(props.movie.posterImage, config.public.apiBase)
)
</script>

<template>
  <NuxtLink
    :to="`/movies/${movie.id}`"
    class="group block"
    :data-testid="`movie-link-${movie.id}`"
  >
    <div class="bg-white rounded-lg overflow-hidden shadow-sm transition-shadow hover:shadow-lg border border-gray-200">
      <div class="aspect-[2/3] relative overflow-hidden bg-gray-100">
        <img
          :src="posterUrl"
          :alt="movie.title"
          class="w-full h-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
          decoding="async"
        >
      </div>

      <div class="p-4">
        <h3 class="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
          {{ movie.title }}
        </h3>
        <div class="mt-2 flex items-center gap-3 text-sm text-gray-500">
          <span>{{ movie.year }}</span>
          <span>•</span>
          <span>{{ formatDuration(movie.lengthMinutes) }}</span>
          <span>•</span>
          <span class="flex items-center gap-1">
            <UIcon
              name="i-lucide-star"
              class="w-4 h-4 text-yellow-500"
            />
            <span class="font-semibold text-gray-700">{{ movie.rating.toFixed(1) }}</span>
          </span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>
