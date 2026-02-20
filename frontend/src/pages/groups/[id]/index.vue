<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useGroupsStore } from '@/stores/groups'
import { useGamesStore } from '@/stores/games'
import ManaColors from '@/components/ManaColors.vue'

defineOptions({ meta: { requiresAuth: true } })

const route = useRoute('/groups/[id]/')
const groupId = route.params.id
const groupsStore = useGroupsStore()
const gamesStore = useGamesStore()

const filterFormat = ref('')
const filterPlayer = ref('')

const tabs = [
  { label: 'Parties', to: `/groups/${groupId}` },
  { label: 'Statistiques', to: `/groups/${groupId}/stats` },
  { label: 'Membres', to: `/groups/${groupId}/members` },
]

const groupName = computed(() => groupsStore.currentGroup?.name ?? 'Groupe')
const members = computed(() => groupsStore.currentGroup?.group_members ?? [])

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function winnerName(game: typeof gamesStore.games[0]) {
  const winner = game.game_players.find(p => p.is_winner)
  return winner?.profiles.username ?? null
}

function loadGames() {
  gamesStore.fetchGames(groupId, {
    formatId: filterFormat.value || undefined,
    userId: filterPlayer.value || undefined,
  })
}

watch([filterFormat, filterPlayer], () => loadGames())

onMounted(() => {
  groupsStore.fetchGroup(groupId)
  gamesStore.fetchFormats()
  loadGames()
})
</script>

<template>
  <div>
    <div class="mb-6">
      <router-link to="/dashboard" class="text-sm text-indigo-600 hover:text-indigo-800">&larr; Tableau de bord</router-link>
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

      <!-- Toolbar -->
      <div class="flex flex-wrap items-center gap-3 mb-6">
        <router-link
          :to="`/groups/${groupId}/games/new`"
          class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Nouvelle partie
        </router-link>

        <select
          v-model="filterFormat"
          class="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Tous les formats</option>
          <option v-for="fmt in gamesStore.formats" :key="fmt.id" :value="fmt.id">
            {{ fmt.name }}
          </option>
        </select>

        <select
          v-model="filterPlayer"
          class="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Tous les joueurs</option>
          <option v-for="member in members" :key="member.user_id" :value="member.user_id">
            {{ member.profiles.username }}
          </option>
        </select>
      </div>

      <!-- Games list -->
      <div v-if="gamesStore.loading" class="text-gray-400 text-sm">Chargement des parties...</div>
      <div v-else-if="gamesStore.games.length === 0" class="text-gray-500 text-sm">
        Aucune partie enregistrée pour le moment.
      </div>
      <div v-else class="space-y-3">
        <router-link
          v-for="game in gamesStore.games"
          :key="game.id"
          :to="`/groups/${groupId}/games/${game.id}`"
          class="block rounded-lg border border-gray-200 bg-white p-4 hover:border-indigo-300 transition-colors"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-500">{{ formatDate(game.played_at) }}</span>
            <span class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
              {{ game.game_formats.name }}
            </span>
          </div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="player in game.game_players"
              :key="player.user_id"
              class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
              :class="player.is_winner
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-700'"
            >
              {{ player.profiles.username }}
              <template v-if="player.deck_name"> — {{ player.deck_name }}</template>
              <ManaColors v-if="player.deck_colors?.length" :model-value="player.deck_colors" readonly size="sm" />
              <template v-if="player.is_winner"> ★</template>
            </span>
          </div>
          <div v-if="winnerName(game)" class="mt-2 text-sm text-green-700 font-medium">
            Gagnant : {{ winnerName(game) }}
          </div>
        </router-link>
      </div>
    </template>
  </div>
</template>
