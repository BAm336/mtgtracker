<script setup lang="ts">
defineOptions({ meta: { layout: 'auth' } })
</script>

<template>
  <div class="text-center">
    <h1 class="text-4xl font-bold mb-4">MTG Tracker</h1>
    <p class="text-lg text-gray-600 mb-8">Track your Magic: The Gathering games with friends</p>
    <div class="flex gap-4 justify-center">
      <router-link to="/login" class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
        Log in
      </router-link>
      <router-link to="/register" class="px-6 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50">
        Sign up
      </router-link>
    </div>
  </div>
</template>
