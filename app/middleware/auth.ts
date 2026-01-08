/**
 * Auth middleware - protects routes that require authentication
 */
export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie('auth_token')

  if (!token.value) {
    return navigateTo({
      path: '/login',
      query: {
        redirect: to.fullPath
      }
    })
  }
})
