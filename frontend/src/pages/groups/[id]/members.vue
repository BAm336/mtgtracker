<script setup lang="ts">
import { useRoute } from 'vue-router'

defineOptions({ meta: { requiresAuth: true } })

const route = useRoute('/groups/[id]/members')
const groupId = route.params.id
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Members</h1>
    <p class="text-gray-500">Members of group {{ groupId }}</p>
  </div>
</template>
