<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'

const route = useRoute()

const layout = computed(() => {
  const meta = route.meta as { layout?: string }
  return meta.layout === 'auth' ? AuthLayout : DefaultLayout
})
</script>

<template>
  <component :is="layout">
    <router-view />
  </component>
</template>
