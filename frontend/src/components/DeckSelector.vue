<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import ManaColors from './ManaColors.vue'
import type { DeckWithOwner } from '@/stores/decks'

export interface DeckInput {
  deckId: string | null
  deckName: string
  deckColors: string[]
  saveToLibrary: boolean
}

interface Props {
  modelValue: DeckInput
  decks: DeckWithOwner[]
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [DeckInput] }>()

// Dropdown value: '' | 'free' | deckId
function initialSelect(): string {
  if (props.modelValue.deckId) return props.modelValue.deckId
  if (props.modelValue.deckColors.length > 0 || props.modelValue.deckName) return 'free'
  return ''
}

const selectValue = ref<string>(initialSelect())
const freeName = ref(props.modelValue.deckId ? '' : props.modelValue.deckName)
const freeColors = ref<string[]>(props.modelValue.deckId ? [] : [...props.modelValue.deckColors])
const saveToLibrary = ref(props.modelValue.saveToLibrary)

const selectedDeck = computed(() => props.decks.find(d => d.id === selectValue.value))
const isFree = computed(() => selectValue.value === 'free')

function emitFromLibrary(deck: DeckWithOwner) {
  emit('update:modelValue', {
    deckId: deck.id,
    deckName: deck.name,
    deckColors: [...deck.colors],
    saveToLibrary: false,
  })
}

function emitFree() {
  emit('update:modelValue', {
    deckId: null,
    deckName: freeName.value,
    deckColors: freeColors.value,
    saveToLibrary: saveToLibrary.value,
  })
}

function emitEmpty() {
  emit('update:modelValue', { deckId: null, deckName: '', deckColors: [], saveToLibrary: false })
}

watch(selectValue, (val) => {
  const deck = props.decks.find(d => d.id === val)
  if (deck) {
    emitFromLibrary(deck)
  } else if (val === 'free') {
    emitFree()
  } else {
    emitEmpty()
  }
})

watch([freeName, freeColors, saveToLibrary], () => {
  if (isFree.value) emitFree()
}, { deep: true })
</script>

<template>
  <div class="space-y-2">
    <!-- Dropdown: library decks + free entry option -->
    <select
      v-model="selectValue"
      class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white"
    >
      <option value="">-- Choisir un deck --</option>
      <optgroup v-if="decks.length > 0" label="Bibliothèque du groupe">
        <option v-for="deck in decks" :key="deck.id" :value="deck.id">
          {{ deck.name }}
          <template v-if="deck.profiles"> ({{ deck.profiles.username }})</template>
        </option>
      </optgroup>
      <option value="free">+ Saisie libre</option>
    </select>

    <!-- Library deck selected: show colors read-only -->
    <div v-if="selectedDeck" class="flex items-center gap-2 px-1">
      <ManaColors :model-value="selectedDeck.colors" readonly size="sm" />
      <span class="text-xs text-gray-500">{{ selectedDeck.name }}</span>
    </div>

    <!-- Free entry mode -->
    <template v-if="isFree">
      <input
        v-model="freeName"
        type="text"
        placeholder="Nom du deck (optionnel)"
        class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
      />
      <div>
        <p class="text-xs text-gray-500 mb-1.5">Couleurs <span class="text-red-500">*</span></p>
        <ManaColors v-model="freeColors" />
      </div>
      <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
        <input
          v-model="saveToLibrary"
          type="checkbox"
          class="rounded border-gray-300 text-indigo-600"
        />
        Enregistrer dans la bibliothèque du groupe
      </label>
    </template>
  </div>
</template>
