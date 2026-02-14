import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Group = Database['public']['Tables']['groups']['Row']
type GroupMember = Database['public']['Tables']['group_members']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

export interface GroupWithCount extends Group {
  group_members: { count: number }[]
}

export interface MemberWithProfile extends GroupMember {
  profiles: Profile
}

export interface GroupWithMembers extends Group {
  group_members: MemberWithProfile[]
}

export const useGroupsStore = defineStore('groups', () => {
  const groups = ref<GroupWithCount[]>([])
  const currentGroup = ref<GroupWithMembers | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchGroups() {
    loading.value = true
    error.value = null
    const { data, error: err } = await supabase
      .from('groups')
      .select('*, group_members(count)')
      .order('created_at', { ascending: false })

    if (err) {
      error.value = err.message
    } else {
      groups.value = data as unknown as GroupWithCount[]
    }
    loading.value = false
  }

  async function fetchGroup(groupId: string) {
    loading.value = true
    error.value = null
    const { data, error: err } = await supabase
      .from('groups')
      .select('*, group_members(*, profiles(*))')
      .eq('id', groupId)
      .single()

    if (err) {
      error.value = err.message
      currentGroup.value = null
    } else {
      currentGroup.value = data as unknown as GroupWithMembers
    }
    loading.value = false
  }

  async function createGroup(name: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non authentifié' }

    const { data, error: err } = await supabase
      .from('groups')
      .insert({ name, created_by: user.id })
      .select()
      .single()

    if (err) return { error: err.message }

    const { error: memberErr } = await supabase
      .from('group_members')
      .insert({ group_id: data.id, user_id: user.id, role: 'admin' })

    if (memberErr) return { error: memberErr.message }

    await fetchGroups()
    return { data }
  }

  async function createInvitation(groupId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non authentifié' }

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const { error: err } = await supabase
      .from('group_invitations')
      .insert({
        group_id: groupId,
        code,
        created_by: user.id,
        expires_at: expiresAt.toISOString(),
      })

    if (err) return { error: err.message }
    return { code }
  }

  async function joinGroup(code: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non authentifié' }

    const { data: invitation, error: invErr } = await supabase
      .from('group_invitations')
      .select('*')
      .eq('code', code)
      .gte('expires_at', new Date().toISOString())
      .single()

    if (invErr || !invitation) return { error: 'Code d\'invitation invalide ou expiré' }

    // Check if already a member
    const { data: existing } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', invitation.group_id)
      .eq('user_id', user.id)
      .single()

    if (existing) return { error: 'Vous êtes déjà membre de ce groupe', groupId: invitation.group_id }

    const { error: joinErr } = await supabase
      .from('group_members')
      .insert({ group_id: invitation.group_id, user_id: user.id, role: 'member' })

    if (joinErr) return { error: joinErr.message }

    return { groupId: invitation.group_id }
  }

  async function leaveGroup(groupId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non authentifié' }

    const { data: members } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', groupId)
      .order('joined_at', { ascending: true })

    if (!members) return { error: 'Erreur lors de la récupération des membres' }

    const currentMember = members.find(m => m.user_id === user.id)
    if (!currentMember) return { error: 'Vous n\'êtes pas membre de ce groupe' }

    const admins = members.filter(m => m.role === 'admin')
    const otherMembers = members.filter(m => m.user_id !== user.id)

    // If last admin and there are other members, promote the oldest member
    if (currentMember.role === 'admin' && admins.length === 1 && otherMembers.length > 0) {
      await supabase
        .from('group_members')
        .update({ role: 'admin' })
        .eq('group_id', groupId)
        .eq('user_id', otherMembers[0].user_id)
    }

    const { error: err } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', user.id)

    if (err) return { error: err.message }

    await fetchGroups()
    return {}
  }

  async function removeMember(groupId: string, userId: string) {
    const { error: err } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId)

    if (err) return { error: err.message }

    await fetchGroup(groupId)
    return {}
  }

  return {
    groups,
    currentGroup,
    loading,
    error,
    fetchGroups,
    fetchGroup,
    createGroup,
    createInvitation,
    joinGroup,
    leaveGroup,
    removeMember,
  }
})
