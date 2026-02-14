<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute('/invite/[code]')
const code = route.params.code
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Group invitation</h1>
    <p class="text-gray-500">Invitation code: {{ code }}</p>
  </div>
</template>
