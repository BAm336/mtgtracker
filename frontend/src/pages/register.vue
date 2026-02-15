<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

defineOptions({ meta: { layout: 'auth' } })

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const error = ref('')
const submitting = ref(false)

const usernameRegex = /^[a-zA-Z0-9_-]+$/

function validate(): string | null {
  if (username.value.length < 2 || username.value.length > 30) {
    return 'Le pseudo doit contenir entre 2 et 30 caractères.'
  }
  if (!usernameRegex.test(username.value)) {
    return 'Le pseudo ne peut contenir que des lettres, chiffres, tirets et underscores.'
  }
  if (password.value.length < 8) {
    return 'Le mot de passe doit contenir au moins 8 caractères.'
  }
  if (password.value !== passwordConfirm.value) {
    return 'Les mots de passe ne correspondent pas.'
  }
  return null
}

async function handleRegister() {
  error.value = ''

  const validationError = validate()
  if (validationError) {
    error.value = validationError
    return
  }

  submitting.value = true
  const { error: err } = await authStore.signUp(email.value, password.value, username.value)
  submitting.value = false

  if (err) {
    error.value = err.message
    return
  }

  router.push('/dashboard')
}
</script>

<template>
  <div class="max-w-md mx-auto">
    <h1 class="text-2xl font-bold mb-6">Créer un compte</h1>

    <form @submit.prevent="handleRegister" class="space-y-4">
      <div>
        <label for="username" class="block text-sm font-medium mb-1">Pseudo</label>
        <input
          id="username"
          v-model="username"
          type="text"
          required
          autocomplete="username"
          class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

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

      <div>
        <label for="password" class="block text-sm font-medium mb-1">Mot de passe</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          autocomplete="new-password"
          class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label for="password-confirm" class="block text-sm font-medium mb-1">Confirmer le mot de passe</label>
        <input
          id="password-confirm"
          v-model="passwordConfirm"
          type="password"
          required
          autocomplete="new-password"
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
        {{ submitting ? '...' : 'Créer mon compte' }}
      </button>
    </form>

    <p class="mt-4 text-sm text-center">
      Déjà un compte ?
      <RouterLink to="/login" class="text-blue-600 hover:underline">Se connecter</RouterLink>
    </p>
  </div>
</template>
