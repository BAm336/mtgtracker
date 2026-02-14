<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

defineOptions({ meta: { layout: 'auth' } })

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const magicLinkMode = ref(false)
const magicLinkSent = ref(false)
const submitting = ref(false)

async function handleLogin() {
  error.value = ''
  submitting.value = true

  const { error: err } = await authStore.signIn(email.value, password.value)
  submitting.value = false

  if (err) {
    error.value = err.message
    return
  }

  router.push((route.query.redirect as string) || '/dashboard')
}

async function handleMagicLink() {
  error.value = ''
  submitting.value = true

  const { error: err } = await authStore.signInWithMagicLink(email.value)
  submitting.value = false

  if (err) {
    error.value = err.message
    return
  }

  magicLinkSent.value = true
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Se connecter</h1>

    <div v-if="magicLinkSent" class="p-4 bg-green-100 text-green-800 rounded mb-4">
      Un lien de connexion a été envoyé à <strong>{{ email }}</strong>. Vérifiez votre boîte mail.
    </div>

    <form v-else @submit.prevent="magicLinkMode ? handleMagicLink() : handleLogin()" class="space-y-4">
      <div>
        <label for="email" class="block text-sm font-medium mb-1">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          autocomplete="email"
          class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div v-if="!magicLinkMode">
        <label for="password" class="block text-sm font-medium mb-1">Mot de passe</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          autocomplete="current-password"
          class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div v-if="error" class="p-3 bg-red-100 text-red-700 rounded text-sm">
        {{ error }}
      </div>

      <button
        type="submit"
        :disabled="submitting"
        class="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {{ submitting ? '...' : magicLinkMode ? 'Envoyer le lien' : 'Se connecter' }}
      </button>
    </form>

    <div class="mt-4 text-sm text-center space-y-2">
      <button
        v-if="!magicLinkSent"
        type="button"
        class="text-blue-600 hover:underline"
        @click="magicLinkMode = !magicLinkMode; error = ''"
      >
        {{ magicLinkMode ? 'Connexion avec mot de passe' : 'Connexion par magic link' }}
      </button>
      <p>
        Pas encore de compte ?
        <RouterLink to="/register" class="text-blue-600 hover:underline">Créer un compte</RouterLink>
      </p>
    </div>
  </div>
</template>
