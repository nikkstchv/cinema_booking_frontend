<script setup lang="ts">
import { useAuth } from '~/features/auth/composables/useAuth'
import { NAV_ITEMS } from '~/shared/lib/constants'

const { isAuthenticated, logout, init } = useAuth()

// Initialize auth state
onMounted(() => {
  init()
})

const navigation = computed(() => {
  const items = [...NAV_ITEMS]

  // Add auth-dependent items
  if (isAuthenticated.value) {
    return items
  }

  // Remove "My tickets" for unauthenticated users
  return items.filter(item => item.to !== '/my-tickets')
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Skip link for a11y -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg"
    >
      Перейти к основному содержимому
    </a>

    <div class="flex">
      <!-- Sidebar -->
      <aside class="w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0">
        <div class="p-4 border-b border-gray-200">
          <NuxtLink
            to="/movies"
            class="flex items-center gap-2"
          >
            <UIcon
              name="i-lucide-clapperboard"
              class="w-8 h-8 text-indigo-600"
            />
            <span class="text-xl font-bold text-gray-900">CinemaBook</span>
          </NuxtLink>
        </div>

        <nav class="p-4">
          <ul class="space-y-1">
            <li
              v-for="item in navigation"
              :key="item.to"
            >
              <NuxtLink
                :to="item.to"
                class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                active-class="bg-indigo-50 text-indigo-700 font-medium"
              >
                <UIcon
                  :name="item.icon"
                  class="w-5 h-5"
                />
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>

          <div class="mt-8 pt-4 border-t border-gray-200">
            <template v-if="isAuthenticated">
              <button
                class="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                @click="logout"
              >
                <UIcon
                  name="i-lucide-log-out"
                  class="w-5 h-5"
                />
                Выход
              </button>
            </template>
            <template v-else>
              <NuxtLink
                to="/login"
                class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                active-class="bg-indigo-50 text-indigo-700 font-medium"
              >
                <UIcon
                  name="i-lucide-log-in"
                  class="w-5 h-5"
                />
                Вход
              </NuxtLink>
            </template>
          </div>
        </nav>
      </aside>

      <!-- Main content -->
      <main
        id="main-content"
        class="flex-1 ml-64 p-8"
        tabindex="-1"
      >
        <slot />
      </main>
    </div>

    <!-- Notifications -->
    <UNotifications aria-live="polite" />
  </div>
</template>
