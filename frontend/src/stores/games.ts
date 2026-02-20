import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Game = Database['public']['Tables']['games']['Row']
type GamePlayer = Database['public']['Tables']['game_players']['Row']
type GameFormat = Database['public']['Tables']['game_formats']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

export interface GamePlayerWithProfile extends GamePlayer {
  profiles: Profile
}

export interface GameWithDetails extends Game {
  game_formats: GameFormat
  game_players: GamePlayerWithProfile[]
}

export interface PlayerInput {
  userId: string
  deckId?: string | null
  deckName?: string
  deckColors?: string[]
  commander?: string
  isWinner: boolean
}

export const useGamesStore = defineStore('games', () => {
  const games = ref<GameWithDetails[]>([])
  const currentGame = ref<GameWithDetails | null>(null)
  const formats = ref<GameFormat[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchFormats() {
    const { data, error: err } = await supabase
      .from('game_formats')
      .select('*')
      .order('name')

    if (err) {
      error.value = err.message
    } else {
      formats.value = data
    }
  }

  async function fetchGames(groupId: string, filters?: { formatId?: string; userId?: string }) {
    loading.value = true
    error.value = null

    let query = supabase
      .from('games')
      .select('*, game_formats(*), game_players(*, profiles(*))')
      .eq('group_id', groupId)
      .order('played_at', { ascending: false })

    if (filters?.formatId) {
      query = query.eq('format_id', filters.formatId)
    }

    const { data, error: err } = await query

    if (err) {
      error.value = err.message
    } else {
      let result = data as unknown as GameWithDetails[]
      if (filters?.userId) {
        result = result.filter(g => g.game_players.some(p => p.user_id === filters.userId))
      }
      games.value = result
    }
    loading.value = false
  }

  async function fetchGame(gameId: string) {
    loading.value = true
    error.value = null

    const { data, error: err } = await supabase
      .from('games')
      .select('*, game_formats(*), game_players(*, profiles(*))')
      .eq('id', gameId)
      .single()

    if (err) {
      error.value = err.message
      currentGame.value = null
    } else {
      currentGame.value = data as unknown as GameWithDetails
    }
    loading.value = false
  }

  async function createGame(params: {
    groupId: string
    formatId: string
    playedAt: string
    players: PlayerInput[]
  }) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non authentifié' }

    const { data, error: err } = await supabase
      .from('games')
      .insert({
        group_id: params.groupId,
        format_id: params.formatId,
        played_at: params.playedAt,
        created_by: user.id,
      })
      .select()
      .single()

    if (err) return { error: err.message }

    const playersInsert = params.players.map(p => ({
      game_id: data.id,
      user_id: p.userId,
      deck_id: p.deckId || null,
      deck_name: p.deckName || null,
      deck_colors: p.deckColors ?? [],
      commander: p.commander || null,
      is_winner: p.isWinner,
    }))

    const { error: playersErr } = await supabase
      .from('game_players')
      .insert(playersInsert)

    if (playersErr) return { error: playersErr.message }

    return { data }
  }

  async function updateGame(gameId: string, params: {
    formatId: string
    playedAt: string
    players: PlayerInput[]
  }) {
    const { error: err } = await supabase
      .from('games')
      .update({
        format_id: params.formatId,
        played_at: params.playedAt,
      })
      .eq('id', gameId)

    if (err) return { error: err.message }

    // Delete existing players then re-insert
    const { error: delErr } = await supabase
      .from('game_players')
      .delete()
      .eq('game_id', gameId)

    if (delErr) return { error: delErr.message }

    const playersInsert = params.players.map(p => ({
      game_id: gameId,
      user_id: p.userId,
      deck_id: p.deckId || null,
      deck_name: p.deckName || null,
      deck_colors: p.deckColors ?? [],
      commander: p.commander || null,
      is_winner: p.isWinner,
    }))

    const { error: playersErr } = await supabase
      .from('game_players')
      .insert(playersInsert)

    if (playersErr) return { error: playersErr.message }

    return {}
  }

  async function deleteGame(gameId: string) {
    const { error: err } = await supabase
      .from('games')
      .delete()
      .eq('id', gameId)

    if (err) return { error: err.message }
    return {}
  }

  return {
    games,
    currentGame,
    formats,
    loading,
    error,
    fetchFormats,
    fetchGames,
    fetchGame,
    createGame,
    updateGame,
    deleteGame,
  }
})
