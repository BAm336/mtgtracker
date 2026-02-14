<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useGroupsStore } from '@/stores/groups'

defineOptions({ meta: { requiresAuth: true } })

const route = useRoute('/groups/[id]/')
const groupId = route.params.id
const groupsStore = useGroupsStore()

const tabs = [
  { label: 'Parties', to: `/groups/${groupId}` },
  { label: 'Statistiques', to: `/groups/${groupId}/stats` },
  { label: 'Membres', to: `/groups/${groupId}/members` },
]

const groupName = computed(() => groupsStore.currentGroup?.name ?? 'Groupe')

onMounted(() => {
  groupsStore.fetchGroup(groupId)
})
</script>

<template>
  <div>
    <div class="mb-6">
      <router-link to="/dashboard" class="text-sm text-indigo-600 hover:text-indigo-800">&larr; Dashboard</router-link>
    </div>

    <h1 v-if="groupsStore.loading" class="text-2xl font-bold mb-6 text-gray-400">Chargement...</h1>
    <h1 v-else-if="groupsStore.error" class="text-2xl font-bold mb-6 text-red-600">Groupe introuvable</h1>
    <template v-else>
      <h1 class="text-2xl font-bold mb-6">{{ groupName }}</h1>

      <!-- Sub-navigation tabs -->
      <nav class="flex border-b border-gray-200 mb-6">
        <router-link
          v-for="tab in tabs"
          :key="tab.to"
          :to="tab.to"
          class="px-4 py-2 text-sm font-medium border-b-2 -mb-px"
          :class="route.path === tab.to
            ? 'border-indigo-600 text-indigo-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
        >
          {{ tab.label }}
        </router-link>
      </nav>

      <!-- Content: placeholder for games -->
      <p class="text-gray-500">Historique des parties à venir</p>
    </template>
  </div>
</template>
