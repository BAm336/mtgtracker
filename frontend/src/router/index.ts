import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import { useAuthStore } from '@/stores/auth'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

const publicPages = ['/', '/login', '/register', '/reset-password', '/auth/verify']

router.beforeEach((to) => {
  const authStore = useAuthStore()

  const isPublic = publicPages.includes(to.path) || to.path.startsWith('/invite/')
  const isAuthPage = ['/', '/login', '/register'].includes(to.path)

  if (!isPublic && !authStore.isAuthenticated()) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (isAuthPage && authStore.isAuthenticated()) {
    return '/dashboard'
  }
})
