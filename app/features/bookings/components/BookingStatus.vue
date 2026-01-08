<script setup lang="ts">
defineProps<{
  isPaid: boolean
}>()
</script>

<template>
  <UBadge
    :color="isPaid ? 'green' : 'yellow'"
    variant="subtle"
    size="sm"
  >
    <UIcon
      :name="isPaid ? 'i-lucide-check-circle' : 'i-lucide-clock'"
      class="w-3 h-3 mr-1"
    />
    {{ isPaid ? 'Оплачено' : 'Ожидает оплаты' }}
  </UBadge>
</template>
