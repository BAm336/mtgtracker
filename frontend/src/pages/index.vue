<script setup lang="ts">
defineOptions({ meta: { layout: 'auth' } })
</script>

<template>
  <div class="space-y-16">
    <!-- Hero Section -->
    <div class="text-center space-y-6">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-medium">
        <span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
        Gratuit et open source
      </div>

      <h1 class="text-5xl sm:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
        MTG <span class="text-indigo-600">Tracker</span>
      </h1>

      <p class="text-xl text-gray-500 max-w-lg mx-auto leading-relaxed">
        Suivez vos parties de Magic: The Gathering entre amis.
        Statistiques, classements et historique en un coup d'oeil.
      </p>

      <!-- CTA Buttons -->
      <div class="flex gap-4 justify-center pt-2">
        <router-link
          to="/register"
          class="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          Commencer gratuitement
        </router-link>
        <router-link
          to="/login"
          class="px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
        >
          Se connecter
        </router-link>
      </div>
    </div>

    <!-- Illustration -->
    <div class="flex justify-center">
      <img
        src="/hero-illustration.svg"
        alt="Illustration de cartes Magic et statistiques"
        class="w-full max-w-md opacity-90"
      />
    </div>

    <!-- Features -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
      <div class="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
        <div class="w-12 h-12 mx-auto mb-4 rounded-xl bg-indigo-50 flex items-center justify-center">
          <svg class="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </div>
        <h3 class="font-bold text-gray-900 mb-2">Groupes de jeu</h3>
        <p class="text-sm text-gray-500 leading-relaxed">
          Cr&eacute;ez des groupes, invitez vos amis et retrouvez toutes vos parties au m&ecirc;me endroit.
        </p>
      </div>

      <div class="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
        <div class="w-12 h-12 mx-auto mb-4 rounded-xl bg-indigo-50 flex items-center justify-center">
          <svg class="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
        </div>
        <h3 class="font-bold text-gray-900 mb-2">Statistiques</h3>
        <p class="text-sm text-gray-500 leading-relaxed">
          Analysez vos performances par format, par deck et d&eacute;couvrez qui domine votre groupe.
        </p>
      </div>

      <div class="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
        <div class="w-12 h-12 mx-auto mb-4 rounded-xl bg-indigo-50 flex items-center justify-center">
          <svg class="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h3 class="font-bold text-gray-900 mb-2">Historique complet</h3>
        <p class="text-sm text-gray-500 leading-relaxed">
          Enregistrez chaque partie avec les joueurs, les decks, le format et le vainqueur.
        </p>
      </div>
    </div>

    <!-- Footer note -->
    <p class="text-center text-sm text-gray-400 pb-8">
      Tous les formats support&eacute;s &mdash; Standard, Commander, Modern, Draft et plus encore.
    </p>
  </div>
</template>
