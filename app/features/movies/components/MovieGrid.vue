<script setup lang="ts">
import type { Movie } from '~/shared/schemas'
import MovieCard from './MovieCard.vue'

defineProps<{
  movies: Movie[]
  loading?: boolean
}>()
</script>

<template>
  <div>
    <!-- Loading skeletons -->
    <div
      v-if="loading"
      :style="{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }"
    >
      <div
        v-for="i in 10"
        :key="i"
        class="space-y-3"
      >
        <USkeleton class="aspect-[2/3] w-full rounded-lg" />
        <USkeleton class="h-5 w-3/4" />
        <USkeleton class="h-4 w-1/2" />
      </div>
    </div>

    <!-- Movies grid -->
    <div
      v-else-if="movies.length"
      :style="{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }"
    >
      <MovieCard
        v-for="movie in movies"
        :key="movie.id"
        :movie="movie"
      />
    </div>

    <!-- Empty state -->
    <UCard
      v-else
      class="text-center py-12"
    >
      <UIcon
        name="i-lucide-film"
        class="w-12 h-12 mx-auto text-gray-400 mb-4"
      />
      <h3 class="text-lg font-medium text-gray-900 mb-2">
        Фильмы не найдены
      </h3>
      <p class="text-gray-500">
        Попробуйте обновить страницу
      </p>
    </UCard>
  </div>
</template>
