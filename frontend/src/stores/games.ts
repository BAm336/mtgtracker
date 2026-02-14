import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Database } from '@/types/database'

type Game = Database['public']['Tables']['games']['Row']

export const useGamesStore = defineStore('games', () => {
  const games = ref<Game[]>([])
  const loading = ref(false)

  // TODO: implement CRUD operations

  return { games, loading }
})
