<script setup lang="ts">
// MTG color definitions with authentic color palette
const MANA_COLORS = [
  { id: 'W', label: 'W', title: 'Blanc',    bg: '#f9faf4', border: '#c0b89a', color: '#40352b' },
  { id: 'U', label: 'U', title: 'Bleu',     bg: '#0e68ab', border: '#0a4a7a', color: '#ffffff' },
  { id: 'B', label: 'B', title: 'Noir',     bg: '#150b00', border: '#3d3428', color: '#e0d8cf' },
  { id: 'R', label: 'R', title: 'Rouge',    bg: '#d3202a', border: '#9e1a1a', color: '#ffffff' },
  { id: 'G', label: 'G', title: 'Vert',     bg: '#00733e', border: '#005a30', color: '#ffffff' },
  { id: 'C', label: '◇', title: 'Incolore', bg: '#ccc2c0', border: '#9e9695', color: '#3a3333' },
]

interface Props {
  modelValue: string[]
  readonly?: boolean
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  size: 'md',
})
const emit = defineEmits<{ 'update:modelValue': [string[]] }>()

function isSelected(id: string) {
  return props.modelValue.includes(id)
}

function toggleColor(id: string) {
  if (props.readonly) return
  const current = [...props.modelValue]
  if (id === 'C') {
    // Colorless is mutually exclusive with other colors
    emit('update:modelValue', current.includes('C') ? [] : ['C'])
    return
  }
  // Regular color: deselect colorless if present, then toggle
  const withoutColorless = current.filter(c => c !== 'C')
  const idx = withoutColorless.indexOf(id)
  if (idx >= 0) {
    withoutColorless.splice(idx, 1)
  } else {
    withoutColorless.push(id)
  }
  emit('update:modelValue', withoutColorless)
}

function colorStyle(colorId: string) {
  const c = MANA_COLORS.find(m => m.id === colorId)!
  if (isSelected(colorId)) {
    return { backgroundColor: c.bg, borderColor: c.border, color: c.color }
  }
  return { backgroundColor: '#f3f4f6', borderColor: '#d1d5db', color: '#9ca3af' }
}
</script>

<template>
  <!-- Display mode: only show selected colors -->
  <div v-if="readonly" class="flex flex-wrap gap-1">
    <span
      v-for="c in MANA_COLORS.filter(m => modelValue.includes(m.id))"
      :key="c.id"
      :title="c.title"
      :style="{ backgroundColor: c.bg, borderColor: c.border, color: c.color }"
      class="inline-flex items-center justify-center rounded-full font-bold border"
      :class="size === 'sm' ? 'w-5 h-5 text-xs' : 'w-7 h-7 text-sm'"
    >
      {{ c.label }}
    </span>
    <span v-if="modelValue.length === 0" class="text-gray-400 text-xs">—</span>
  </div>

  <!-- Interactive mode: all 6 symbols, clickable -->
  <div v-else class="flex flex-wrap gap-1.5">
    <button
      v-for="c in MANA_COLORS"
      :key="c.id"
      type="button"
      :title="c.title"
      :style="colorStyle(c.id)"
      class="rounded-full font-bold border-2 transition-all cursor-pointer"
      :class="[
        size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm',
        !isSelected(c.id) ? 'opacity-40 hover:opacity-70' : 'opacity-100 shadow-sm',
      ]"
      @click="toggleColor(c.id)"
    >
      {{ c.label }}
    </button>
  </div>
</template>
