<script setup lang="ts">
import { useRoute } from 'vue-router'

defineOptions({ meta: { requiresAuth: true } })

const route = useRoute('/groups/[id]/')
const groupId = route.params.id
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Group</h1>
    <p class="text-gray-500">Group {{ groupId }} details coming soon</p>
  </div>
</template>
