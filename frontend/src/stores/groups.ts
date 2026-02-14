import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Database } from '@/types/database'

type Group = Database['public']['Tables']['groups']['Row']

export const useGroupsStore = defineStore('groups', () => {
  const groups = ref<Group[]>([])
  const currentGroup = ref<Group | null>(null)
  const loading = ref(false)

  // TODO: implement CRUD operations

  return { groups, currentGroup, loading }
})
