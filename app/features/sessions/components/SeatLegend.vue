<script setup lang="ts">
const legend = [
  { label: 'Свободно', class: 'bg-gray-100 border-gray-300' },
  { label: 'Выбрано', class: 'bg-indigo-500 border-indigo-600' },
  { label: 'Занято', class: 'bg-red-100 border-red-300' }
]
</script>

<template>
  <div class="flex items-center justify-center px-4">
    <template
      v-for="(item, index) in legend"
      :key="item.label"
    >
      <div
        v-if="index > 0"
        class="w-6"
      />
      <div class="flex items-center gap-2">
        <div
          class="w-6 h-6 rounded border-2"
          :class="item.class"
        />
        <span class="text-sm text-gray-600">{{ item.label }}</span>
      </div>
    </template>
  </div>
</template>
