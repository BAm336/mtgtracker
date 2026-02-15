<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'

defineOptions({ meta: { layout: 'auth' } })

const router = useRouter()

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    router.replace('/dashboard')
  } else {
    // Listen for auth state change from the URL token exchange
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        subscription.unsubscribe()
        router.replace('/dashboard')
      }
    })
  }
})
</script>

<template>
  <div class="max-w-md mx-auto">
    <h1 class="text-2xl font-bold mb-6">Vérification...</h1>
    <p class="text-gray-500">Vérification de votre lien de connexion</p>
  </div>
</template>
