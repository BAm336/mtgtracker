<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useGroupsStore } from '@/stores/groups'

defineOptions({ meta: { requiresAuth: true } })

const route = useRoute('/groups/[id]/members')
const router = useRouter()
const groupId = route.params.id
const authStore = useAuthStore()
const groupsStore = useGroupsStore()

const invitationCode = ref<string | null>(null)
const invitationLoading = ref(false)
const invitationError = ref<string | null>(null)
const copied = ref(false)
const actionError = ref<string | null>(null)
const confirmLeave = ref(false)
const confirmRemove = ref<string | null>(null)

const currentUserId = computed(() => authStore.user?.id)
const isAdmin = computed(() => {
  if (!groupsStore.currentGroup || !currentUserId.value) return false
  const member = groupsStore.currentGroup.group_members.find(m => m.user_id === currentUserId.value)
  return member?.role === 'admin'
})

const groupName = computed(() => groupsStore.currentGroup?.name ?? 'Groupe')

const tabs = [
  { label: 'Parties', to: `/groups/${groupId}` },
  { label: 'Statistiques', to: `/groups/${groupId}/stats` },
  { label: 'Membres', to: `/groups/${groupId}/members` },
]

async function handleGenerateInvitation() {
  invitationLoading.value = true
  invitationError.value = null
  const result = await groupsStore.createInvitation(groupId)
  if (result.error) {
    invitationError.value = result.error
  } else if (result.code) {
    invitationCode.value = result.code
  }
  invitationLoading.value = false
}

function invitationLink() {
  return `${window.location.origin}/invite/${invitationCode.value}`
}

async function handleCopy() {
  await navigator.clipboard.writeText(invitationLink())
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

async function handleLeave() {
  actionError.value = null
  const result = await groupsStore.leaveGroup(groupId)
  if (result.error) {
    actionError.value = result.error
  } else {
    router.push('/dashboard')
  }
  confirmLeave.value = false
}

async function handleRemove(userId: string) {
  actionError.value = null
  const result = await groupsStore.removeMember(groupId, userId)
  if (result.error) {
    actionError.value = result.error
  }
  confirmRemove.value = null
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

onMounted(() => {
  if (!groupsStore.currentGroup || groupsStore.currentGroup.id !== groupId) {
    groupsStore.fetchGroup(groupId)
  }
})
</script>

<template>
  <div>
    <div class="mb-6">
      <router-link to="/dashboard" class="text-sm text-indigo-600 hover:text-indigo-800">&larr; Dashboard</router-link>
    </div>

    <h1 v-if="groupsStore.loading" class="text-2xl font-bold mb-6 text-gray-400">Chargement...</h1>
    <template v-else-if="groupsStore.currentGroup">
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

      <!-- Error message -->
      <p v-if="actionError" class="text-red-600 text-sm mb-4">{{ actionError }}</p>

      <!-- Members list -->
      <div class="space-y-3 mb-8">
        <div
          v-for="member in groupsStore.currentGroup.group_members"
          :key="member.user_id"
          class="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
        >
          <div>
            <span class="font-medium text-gray-900">{{ member.profiles.username }}</span>
            <span
              v-if="member.role === 'admin'"
              class="ml-2 inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800"
            >
              Admin
            </span>
            <p class="text-sm text-gray-500">Membre depuis le {{ formatDate(member.joined_at) }}</p>
          </div>
          <div class="flex gap-2">
            <!-- Remove button (admin only, not self) -->
            <template v-if="isAdmin && member.user_id !== currentUserId">
              <button
                v-if="confirmRemove !== member.user_id"
                class="text-sm text-red-600 hover:text-red-800"
                @click="confirmRemove = member.user_id"
              >
                Retirer
              </button>
              <div v-else class="flex gap-2">
                <button
                  class="text-sm text-red-600 font-medium hover:text-red-800"
                  @click="handleRemove(member.user_id)"
                >
                  Confirmer
                </button>
                <button
                  class="text-sm text-gray-500 hover:text-gray-700"
                  @click="confirmRemove = null"
                >
                  Annuler
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Invitation section -->
      <div class="rounded-lg border border-gray-200 bg-white p-4 mb-6">
        <h2 class="text-lg font-semibold mb-3">Invitation</h2>
        <div v-if="invitationCode" class="space-y-2">
          <div class="flex items-center gap-2">
            <input
              :value="invitationLink()"
              readonly
              class="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-50"
            />
            <button
              class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              @click="handleCopy"
            >
              {{ copied ? 'Copié !' : 'Copier' }}
            </button>
          </div>
          <p class="text-xs text-gray-500">Ce lien expire dans 7 jours</p>
        </div>
        <div v-else>
          <button
            :disabled="invitationLoading"
            class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            @click="handleGenerateInvitation"
          >
            {{ invitationLoading ? 'Génération...' : 'Générer une invitation' }}
          </button>
          <p v-if="invitationError" class="text-red-600 text-sm mt-2">{{ invitationError }}</p>
        </div>
      </div>

      <!-- Leave group -->
      <div class="border-t border-gray-200 pt-6">
        <div v-if="!confirmLeave">
          <button
            class="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            @click="confirmLeave = true"
          >
            Quitter le groupe
          </button>
        </div>
        <div v-else class="flex items-center gap-3">
          <span class="text-sm text-gray-700">Êtes-vous sûr de vouloir quitter ce groupe ?</span>
          <button
            class="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            @click="handleLeave"
          >
            Confirmer
          </button>
          <button
            class="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            @click="confirmLeave = false"
          >
            Annuler
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
