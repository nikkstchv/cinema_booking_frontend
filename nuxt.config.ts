// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui'
  ],

  devtools: {
    enabled: true
  },

  // App config
  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      title: 'CinemaBook - Бронирование билетов в кино',
      meta: [
        { name: 'description', content: 'Онлайн-бронирование билетов в кинотеатры' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#4f46e5' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'CinemaBook' }
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3022' }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  // Color mode
  colorMode: {
    preference: 'light'
  },

  // Runtime config for API
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3022'
    }
  },

  // Route rules
  routeRules: {
    '/': { redirect: '/movies' }
  },

  compatibilityDate: '2025-01-15',

  // TypeScript strict mode
  typescript: {
    strict: true,
    typeCheck: true
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
