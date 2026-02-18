<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useGroupsStore } from '@/stores/groups'

defineOptions({ meta: { requiresAuth: true } })

const router = useRouter()
const authStore = useAuthStore()
const groupsStore = useGroupsStore()

const username = computed(() => authStore.user?.user_metadata?.username ?? 'joueur')

const newGroupName = ref('')
const creating = ref(false)
const createError = ref<string | null>(null)

const isValidName = computed(() => newGroupName.value.trim().length >= 2 && newGroupName.value.trim().length <= 50)

async function handleCreate() {
  if (!isValidName.value) return
  creating.value = true
  createError.value = null
  const result = await groupsStore.createGroup(newGroupName.value.trim())
  if (result.error) {
    createError.value = result.error
  } else {
    newGroupName.value = ''
  }
  creating.value = false
}

onMounted(async () => {
  await groupsStore.fetchGroups()
  if (groupsStore.groups.length === 1) {
    router.replace(`/groups/${groupsStore.groups[0].id}`)
  }
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Bienvenue, {{ username }}</h1>

    <!-- Create group form -->
    <form class="flex gap-3 mb-8" @submit.prevent="handleCreate">
      <input
        v-model="newGroupName"
        type="text"
        placeholder="Nom du groupe (2-50 caractères)"
        minlength="2"
        maxlength="50"
        class="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      <button
        type="submit"
        :disabled="!isValidName || creating"
        class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ creating ? 'Création...' : 'Créer un groupe' }}
      </button>
    </form>
    <p v-if="createError" class="text-red-600 text-sm mb-4">{{ createError }}</p>

    <!-- Loading -->
    <p v-if="groupsStore.loading" class="text-gray-500">Chargement...</p>

    <!-- Empty state -->
    <p v-else-if="groupsStore.groups.length === 0" class="text-gray-500">
      Vous n'avez pas encore de groupe
    </p>

    <!-- Groups list -->
    <div v-else class="space-y-3">
      <router-link
        v-for="group in groupsStore.groups"
        :key="group.id"
        :to="`/groups/${group.id}`"
        class="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all"
      >
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">{{ group.name }}</h2>
          <span class="text-sm text-gray-500">
            {{ group.group_members[0]?.count ?? 0 }} membre{{ (group.group_members[0]?.count ?? 0) > 1 ? 's' : '' }}
          </span>
        </div>
      </router-link>
    </div>
  </div>
</template>
