import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Deck = Database['public']['Tables']['decks']['Row']

export interface DeckWithOwner extends Deck {
  profiles: { username: string } | null
}

export const useDecksStore = defineStore('decks', () => {
  const decks = ref<DeckWithOwner[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchDecks(groupId: string) {
    loading.value = true
    error.value = null

    const { data, error: err } = await supabase
      .from('decks')
      .select('*, profiles!owner_user_id(username)')
      .eq('group_id', groupId)
      .order('name')

    if (err) {
      error.value = err.message
    } else {
      decks.value = data as unknown as DeckWithOwner[]
    }
    loading.value = false
  }

  async function createDeck(params: {
    groupId: string
    name: string
    colors: string[]
  }): Promise<{ data?: DeckWithOwner; error?: string }> {
    const { data, error: err } = await supabase
      .from('decks')
      .insert({
        group_id: params.groupId,
        name: params.name,
        colors: params.colors,
      })
      .select('*, profiles!owner_user_id(username)')
      .single()

    if (err) return { error: err.message }
    const created = data as unknown as DeckWithOwner
    decks.value = [...decks.value, created].sort((a, b) => a.name.localeCompare(b.name))
    return { data: created }
  }

  return {
    decks,
    loading,
    error,
    fetchDecks,
    createDeck,
  }
})
