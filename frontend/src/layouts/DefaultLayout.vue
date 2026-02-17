<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

async function handleLogout() {
  await authStore.signOut()
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <router-link to="/" class="flex items-center gap-2.5 group">
            <img src="/logo.svg" alt="" class="w-8 h-8 rounded-lg" aria-hidden="true" />
            <span class="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
              MTG <span class="text-indigo-600">Tracker</span>
            </span>
          </router-link>
          <nav class="flex items-center gap-4">
            <router-link to="/dashboard" class="text-gray-600 hover:text-gray-900">Tableau de bord</router-link>
            <router-link to="/profile" class="text-gray-600 hover:text-gray-900">Profil</router-link>
            <button
              class="text-gray-600 hover:text-gray-900"
              @click="handleLogout"
            >
              Déconnexion
            </button>
          </nav>
        </div>
      </div>
    </header>
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
  </div>
</template>
