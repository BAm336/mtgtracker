<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const STORAGE_KEY = 'pwa-install-dismissed'

const visible = ref(false)
const installing = ref(false)

// The deferred prompt event provided by the browser
let deferredPrompt: BeforeInstallPromptEvent | null = null

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function handleBeforeInstallPrompt(e: Event) {
  e.preventDefault()
  deferredPrompt = e as BeforeInstallPromptEvent

  // Only show if not previously dismissed
  if (!localStorage.getItem(STORAGE_KEY)) {
    visible.value = true
  }
}

function handleAppInstalled() {
  visible.value = false
  deferredPrompt = null
}

async function install() {
  if (!deferredPrompt) return
  installing.value = true
  try {
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      visible.value = false
      deferredPrompt = null
    }
  } finally {
    installing.value = false
  }
}

function dismiss() {
  visible.value = false
  localStorage.setItem(STORAGE_KEY, '1')
}

onMounted(() => {
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.addEventListener('appinstalled', handleAppInstalled)
})

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.removeEventListener('appinstalled', handleAppInstalled)
})
</script>

<template>
  <Transition name="slide-up">
    <div
      v-if="visible"
      class="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50"
      role="dialog"
      aria-label="Installer l'application"
    >
      <div class="bg-white border border-gray-200 rounded-2xl shadow-xl p-4 flex items-center gap-4">
        <!-- Logo -->
        <div class="flex-shrink-0">
          <img src="/logo.svg" alt="MTG Tracker" class="w-12 h-12 rounded-xl" />
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-gray-900 truncate">Installer MTG Tracker</p>
          <p class="text-xs text-gray-500 mt-0.5">Accès rapide depuis votre écran d'accueil</p>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2 flex-shrink-0">
          <button
            class="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg transition-colors"
            :disabled="installing"
            @click="dismiss"
          >
            Plus tard
          </button>
          <button
            class="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
            :disabled="installing"
            @click="install"
          >
            {{ installing ? '…' : 'Installer' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(16px);
}
</style>
