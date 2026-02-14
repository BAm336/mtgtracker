<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <router-link to="/dashboard" class="text-xl font-bold text-indigo-600">
            MTG Tracker
          </router-link>
          <nav class="flex items-center gap-4">
            <router-link to="/dashboard" class="text-gray-600 hover:text-gray-900">Dashboard</router-link>
            <router-link to="/profile" class="text-gray-600 hover:text-gray-900">Profile</router-link>
            <button
              class="text-gray-600 hover:text-gray-900"
              @click="authStore.signOut()"
            >
              Log out
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
