<script setup lang="ts">
import { useRoute } from 'vue-router'

defineOptions({ meta: { requiresAuth: true } })

const route = useRoute('/groups/[id]/stats')
const groupId = route.params.id
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Statistiques</h1>
    <p class="text-gray-500">Les statistiques du groupe seront bientôt disponibles.</p>
  </div>
</template>
