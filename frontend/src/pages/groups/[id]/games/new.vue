<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGamesStore } from '@/stores/games'
import { useGroupsStore } from '@/stores/groups'
import { useDecksStore } from '@/stores/decks'
import DeckSelector, { type DeckInput } from '@/components/DeckSelector.vue'

defineOptions({ meta: { requiresAuth: true } })

const route = useRoute('/groups/[id]/games/new')
const router = useRouter()
const groupId = route.params.id
const gamesStore = useGamesStore()
const groupsStore = useGroupsStore()
const decksStore = useDecksStore()

const formatId = ref('')
const playedAt = ref(new Date().toISOString().slice(0, 10))
const selectedPlayerIds = ref<string[]>([])
const playerDeckInputs = ref<Record<string, DeckInput>>({})
const playerCommanders = ref<Record<string, string>>({})
const winnerId = ref('')
const submitting = ref(false)
const formError = ref<string | null>(null)

const members = computed(() => groupsStore.currentGroup?.group_members ?? [])

const isCommander = computed(() => {
  const fmt = gamesStore.formats.find(f => f.id === formatId.value)
  return fmt?.name?.toLowerCase().includes('commander') ?? false
})

function defaultDeckInput(): DeckInput {
  return { deckId: null, deckName: '', deckColors: [], saveToLibrary: false }
}

function togglePlayer(userId: string) {
  const idx = selectedPlayerIds.value.indexOf(userId)
  if (idx >= 0) {
    selectedPlayerIds.value.splice(idx, 1)
    if (winnerId.value === userId) winnerId.value = ''
  } else if (selectedPlayerIds.value.length < 8) {
    selectedPlayerIds.value.push(userId)
    if (!playerDeckInputs.value[userId]) {
      playerDeckInputs.value[userId] = defaultDeckInput()
    }
  }
}

const validationError = computed(() => {
  if (!formatId.value) return 'Sélectionnez un format'
  if (selectedPlayerIds.value.length < 2) return 'Sélectionnez au moins 2 joueurs'
  if (!winnerId.value) return 'Sélectionnez un gagnant'
  if (isCommander.value && selectedPlayerIds.value.some(id => !playerCommanders.value[id]?.trim())) {
    return 'Le champ commander est requis pour ce format'
  }
  if (selectedPlayerIds.value.some(id => (playerDeckInputs.value[id]?.deckColors ?? []).length === 0)) {
    return 'Sélectionnez les couleurs du deck pour chaque joueur'
  }
  return null
})

async function handleSubmit() {
  if (validationError.value) {
    formError.value = validationError.value
    return
  }

  submitting.value = true
  formError.value = null

  // Save decks to library if requested, then build player list
  const players = []
  for (const userId of selectedPlayerIds.value) {
    const input = playerDeckInputs.value[userId] ?? defaultDeckInput()
    let deckId = input.deckId

    if (!deckId && input.saveToLibrary && input.deckColors.length > 0) {
      const result = await decksStore.createDeck({
        groupId,
        name: input.deckName || 'Sans nom',
        colors: input.deckColors,
      })
      if (result.data) deckId = result.data.id
      if (result.error) {
        formError.value = result.error
        submitting.value = false
        return
      }
    }

    players.push({
      userId,
      deckId,
      deckName: deckId ? undefined : (input.deckName || undefined),
      deckColors: input.deckColors,
      commander: playerCommanders.value[userId]?.trim() || undefined,
      isWinner: userId === winnerId.value,
    })
  }

  const result = await gamesStore.createGame({
    groupId,
    formatId: formatId.value,
    playedAt: playedAt.value,
    players,
  })

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
  await decksStore.fetchDecks(groupId)
})
</script>

<template>
  <div>
    <div class="mb-6">
      <router-link :to="`/groups/${groupId}`" class="text-sm text-indigo-600 hover:text-indigo-800">&larr; Retour au groupe</router-link>
    </div>

    <h1 class="text-2xl font-bold mb-6">Nouvelle partie</h1>

    <form class="space-y-6 max-w-lg" @submit.prevent="handleSubmit">
      <!-- Format -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Format</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="fmt in gamesStore.formats"
            :key="fmt.id"
            type="button"
            class="px-4 py-2 rounded-full text-sm font-medium border transition-colors"
            :class="formatId === fmt.id
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-300 hover:bg-indigo-50'"
            @click="formatId = fmt.id"
          >
            {{ fmt.name }}
          </button>
        </div>
      </div>

      <!-- Date -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Date de la partie</label>
        <input
          v-model="playedAt"
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
            :class="{ 'border-indigo-300 bg-indigo-50': selectedPlayerIds.includes(member.user_id) }"
          >
            <input
              type="checkbox"
              :checked="selectedPlayerIds.includes(member.user_id)"
              class="rounded border-gray-300 text-indigo-600"
              @change="togglePlayer(member.user_id)"
            />
            <span class="font-medium text-gray-900">{{ member.profiles.username }}</span>
          </label>
        </div>
      </div>

      <!-- Per-player details -->
      <div v-if="selectedPlayerIds.length > 0" class="space-y-4">
        <h3 class="text-sm font-medium text-gray-700">Détails des joueurs</h3>
        <div
          v-for="playerId in selectedPlayerIds"
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
                name="winner"
                :value="playerId"
                v-model="winnerId"
                class="text-indigo-600"
              />
              <span>Gagnant</span>
            </label>
          </div>
          <DeckSelector
            v-model="playerDeckInputs[playerId]"
            :decks="decksStore.decks"
          />
          <div v-if="isCommander">
            <input
              v-model="playerCommanders[playerId]"
              type="text"
              placeholder="Commander"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <!-- Error -->
      <p v-if="formError" class="text-red-600 text-sm">{{ formError }}</p>

      <!-- Submit -->
      <button
        type="submit"
        :disabled="submitting"
        class="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {{ submitting ? 'Création...' : 'Créer la partie' }}
      </button>
    </form>
  </div>
</template>
