<script setup lang="ts">
import { useRoute } from 'vue-router'

defineOptions({ meta: { requiresAuth: true } })

const route = useRoute('/groups/[id]/games/[gameId]')
const groupId = route.params.id
const gameId = route.params.gameId
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Game details</h1>
    <p class="text-gray-500">Game {{ gameId }} in group {{ groupId }}</p>
  </div>
</template>
