<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGamesStore } from '@/stores/games'
import { useGroupsStore } from '@/stores/groups'

defineOptions({ meta: { requiresAuth: true } })

const route = useRoute('/groups/[id]/games/[gameId]')
const router = useRouter()
const groupId = route.params.id
const gameId = route.params.gameId
const gamesStore = useGamesStore()
const groupsStore = useGroupsStore()

const editing = ref(false)
const confirmDelete = ref(false)
const submitting = ref(false)
const formError = ref<string | null>(null)

// Edit form state
const editFormatId = ref('')
const editPlayedAt = ref('')
const editSelectedPlayerIds = ref<string[]>([])
const editPlayerDecks = ref<Record<string, string>>({})
const editPlayerCommanders = ref<Record<string, string>>({})
const editWinnerId = ref('')

const game = computed(() => gamesStore.currentGame)
const members = computed(() => groupsStore.currentGroup?.group_members ?? [])

const isCommander = computed(() => {
  const fmt = gamesStore.formats.find(f => f.id === editFormatId.value)
  return fmt?.name?.toLowerCase().includes('commander') ?? false
})

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function startEdit() {
  if (!game.value) return
  editFormatId.value = game.value.format_id
  editPlayedAt.value = game.value.played_at.slice(0, 10)
  editSelectedPlayerIds.value = game.value.game_players.map(p => p.user_id)
  editPlayerDecks.value = {}
  editPlayerCommanders.value = {}
  editWinnerId.value = ''
  for (const p of game.value.game_players) {
    if (p.deck_name) editPlayerDecks.value[p.user_id] = p.deck_name
    if (p.commander) editPlayerCommanders.value[p.user_id] = p.commander
    if (p.is_winner) editWinnerId.value = p.user_id
  }
  editing.value = true
  formError.value = null
}

function cancelEdit() {
  editing.value = false
  formError.value = null
}

function togglePlayer(userId: string) {
  const idx = editSelectedPlayerIds.value.indexOf(userId)
  if (idx >= 0) {
    editSelectedPlayerIds.value.splice(idx, 1)
    if (editWinnerId.value === userId) editWinnerId.value = ''
  } else if (editSelectedPlayerIds.value.length < 8) {
    editSelectedPlayerIds.value.push(userId)
  }
}

const validationError = computed(() => {
  if (!editFormatId.value) return 'Sélectionnez un format'
  if (editSelectedPlayerIds.value.length < 2) return 'Sélectionnez au moins 2 joueurs'
  if (!editWinnerId.value) return 'Sélectionnez un gagnant'
  if (isCommander.value && editSelectedPlayerIds.value.some(id => !editPlayerCommanders.value[id]?.trim())) {
    return 'Le champ commander est requis pour ce format'
  }
  return null
})

async function handleUpdate() {
  if (validationError.value) {
    formError.value = validationError.value
    return
  }

  submitting.value = true
  formError.value = null

  const result = await gamesStore.updateGame(gameId, {
    formatId: editFormatId.value,
    playedAt: editPlayedAt.value,
    players: editSelectedPlayerIds.value.map(userId => ({
      userId,
      deckName: editPlayerDecks.value[userId]?.trim() || undefined,
      commander: editPlayerCommanders.value[userId]?.trim() || undefined,
      isWinner: userId === editWinnerId.value,
    })),
  })

  if (result.error) {
    formError.value = result.error
  } else {
    editing.value = false
    await gamesStore.fetchGame(gameId)
  }
  submitting.value = false
}

async function handleDelete() {
  submitting.value = true
  const result = await gamesStore.deleteGame(gameId)
  if (result.error) {
    formError.value = result.error
  } else {
    router.push(`/groups/${groupId}`)
  }
  submitting.value = false
}

onMounted(async () => {
  await gamesStore.fetchFormats()
  if (!groupsStore.currentGroup || groupsStore.currentGroup.id !== groupId) {
    await groupsStore.fetchGroup(groupId)
  }
  await gamesStore.fetchGame(gameId)
})
</script>

<template>
  <div>
    <div class="mb-6">
      <router-link :to="`/groups/${groupId}`" class="text-sm text-indigo-600 hover:text-indigo-800">&larr; Retour au groupe</router-link>
    </div>

    <div v-if="gamesStore.loading" class="text-gray-400">Chargement...</div>
    <div v-else-if="gamesStore.error" class="text-red-600">{{ gamesStore.error }}</div>

    <!-- View mode -->
    <template v-else-if="game && !editing">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">Détail de la partie</h1>
        <div class="flex gap-2">
          <button
            class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            @click="startEdit"
          >
            Modifier
          </button>
          <button
            v-if="!confirmDelete"
            class="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            @click="confirmDelete = true"
          >
            Supprimer
          </button>
          <div v-else class="flex gap-2">
            <button
              class="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              :disabled="submitting"
              @click="handleDelete"
            >
              Confirmer
            </button>
            <button
              class="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              @click="confirmDelete = false"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>

      <div class="space-y-4 max-w-lg">
        <div class="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
          <div class="flex justify-between">
            <span class="text-sm text-gray-500">Date</span>
            <span class="text-sm font-medium">{{ formatDate(game.played_at) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-gray-500">Format</span>
            <span class="text-sm font-medium">{{ game.game_formats.name }}</span>
          </div>
        </div>

        <div class="space-y-2">
          <h3 class="text-sm font-medium text-gray-700">Joueurs</h3>
          <div
            v-for="player in game.game_players"
            :key="player.user_id"
            class="rounded-lg border p-4"
            :class="player.is_winner ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'"
          >
            <div class="flex items-center justify-between">
              <span class="font-medium text-gray-900">{{ player.profiles.username }}</span>
              <span v-if="player.is_winner" class="text-xs font-medium text-green-700 bg-green-100 rounded-full px-2.5 py-0.5">
                Gagnant
              </span>
            </div>
            <div v-if="player.deck_name" class="text-sm text-gray-600 mt-1">
              Deck : {{ player.deck_name }}
            </div>
            <div v-if="player.commander" class="text-sm text-gray-600">
              Commander : {{ player.commander }}
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Edit mode -->
    <template v-else-if="game && editing">
      <h1 class="text-2xl font-bold mb-6">Modifier la partie</h1>

      <form class="space-y-6 max-w-lg" @submit.prevent="handleUpdate">
        <!-- Format -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Format</label>
          <select
            v-model="editFormatId"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="" disabled>Choisir un format</option>
            <option v-for="fmt in gamesStore.formats" :key="fmt.id" :value="fmt.id">
              {{ fmt.name }}
            </option>
          </select>
        </div>

        <!-- Date -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date de la partie</label>
          <input
            v-model="editPlayedAt"
            type="date"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <!-- Player selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Joueurs (2 minimum)</label>
          <div class="space-y-2">
            <label
              v-for="member in members"
              :key="member.user_id"
              class="flex items-center gap-2 rounded-md border border-gray-200 p-3 cursor-pointer hover:bg-gray-50"
              :class="{ 'border-indigo-300 bg-indigo-50': editSelectedPlayerIds.includes(member.user_id) }"
            >
              <input
                type="checkbox"
                :checked="editSelectedPlayerIds.includes(member.user_id)"
                class="rounded border-gray-300 text-indigo-600"
                @change="togglePlayer(member.user_id)"
              />
              <span class="font-medium text-gray-900">{{ member.profiles.username }}</span>
            </label>
          </div>
        </div>

        <!-- Per-player details -->
        <div v-if="editSelectedPlayerIds.length > 0" class="space-y-4">
          <h3 class="text-sm font-medium text-gray-700">Détails des joueurs</h3>
          <div
            v-for="playerId in editSelectedPlayerIds"
            :key="playerId"
            class="rounded-lg border border-gray-200 bg-white p-4 space-y-3"
          >
            <div class="flex items-center justify-between">
              <span class="font-medium text-gray-900">
                {{ members.find(m => m.user_id === playerId)?.profiles.username }}
              </span>
              <label class="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="editWinner"
                  :value="playerId"
                  v-model="editWinnerId"
                  class="text-indigo-600"
                />
                <span>Gagnant</span>
              </label>
            </div>
            <div>
              <input
                v-model="editPlayerDecks[playerId]"
                type="text"
                placeholder="Nom du deck"
                class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div v-if="isCommander">
              <input
                v-model="editPlayerCommanders[playerId]"
                type="text"
                placeholder="Commander"
                class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        <!-- Error -->
        <p v-if="formError" class="text-red-600 text-sm">{{ formError }}</p>

        <!-- Buttons -->
        <div class="flex gap-3">
          <button
            type="submit"
            :disabled="submitting"
            class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {{ submitting ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
          <button
            type="button"
            class="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            @click="cancelEdit"
          >
            Annuler
          </button>
        </div>
      </form>
    </template>
  </div>
</template>
