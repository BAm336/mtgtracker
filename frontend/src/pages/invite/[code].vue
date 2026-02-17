<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useGroupsStore } from '@/stores/groups'

const route = useRoute('/invite/[code]')
const code = route.params.code
const authStore = useAuthStore()
const groupsStore = useGroupsStore()

const status = ref<'loading' | 'success' | 'error' | 'unauthenticated'>('loading')
const errorMessage = ref<string | null>(null)
const groupId = ref<string | null>(null)

onMounted(async () => {
  if (!authStore.isAuthenticated()) {
    status.value = 'unauthenticated'
    return
  }

  const result = await groupsStore.joinGroup(code)
  if (result.error) {
    status.value = 'error'
    errorMessage.value = result.error
    if (result.groupId) {
      groupId.value = result.groupId
    }
  } else if (result.groupId) {
    status.value = 'success'
    groupId.value = result.groupId
  }
})
</script>

<template>
  <div class="min-h-[50vh] flex items-center justify-center">
    <div class="max-w-md w-full text-center">
      <h1 class="text-2xl font-bold mb-6">Invitation de groupe</h1>

      <!-- Loading -->
      <div v-if="status === 'loading'">
        <p class="text-gray-500">Traitement de l'invitation...</p>
      </div>

      <!-- Not authenticated -->
      <div v-else-if="status === 'unauthenticated'" class="space-y-4">
        <p class="text-gray-700">Vous devez être connecté pour rejoindre un groupe.</p>
        <div class="flex justify-center gap-4">
          <router-link
            :to="{ path: '/login', query: { redirect: `/invite/${code}` } }"
            class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Se connecter
          </router-link>
          <router-link
            :to="{ path: '/register', query: { redirect: `/invite/${code}` } }"
            class="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Créer un compte
          </router-link>
        </div>
      </div>

      <!-- Success -->
      <div v-else-if="status === 'success'" class="space-y-4">
        <p class="text-green-700 font-medium">Vous avez rejoint le groupe avec succès !</p>
        <router-link
          :to="`/groups/${groupId}`"
          class="inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Voir le groupe
        </router-link>
      </div>

      <!-- Error -->
      <div v-else-if="status === 'error'" class="space-y-4">
        <p class="text-red-600">{{ errorMessage }}</p>
        <div class="flex justify-center gap-4">
          <router-link
            v-if="groupId"
            :to="`/groups/${groupId}`"
            class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Voir le groupe
          </router-link>
          <router-link
            to="/dashboard"
            class="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Tableau de bord
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
