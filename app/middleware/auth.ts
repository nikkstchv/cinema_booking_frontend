import { useAuth } from '~/features/auth'
import { APP_ROUTES } from '~/shared/lib/app-routes'

export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated.value) {
    return navigateTo({
      path: APP_ROUTES.AUTH.LOGIN,
      query: {
        redirect: to.fullPath
      }
    })
  }
})
