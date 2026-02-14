<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

defineOptions({ meta: { requiresAuth: true } })

const authStore = useAuthStore()

const username = computed(() => authStore.user?.user_metadata?.username ?? 'joueur')
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Bienvenue, {{ username }}</h1>
    <p class="text-gray-500">Vos groupes apparaîtront ici</p>
  </div>
</template>
